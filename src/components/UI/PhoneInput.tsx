"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { getCountries, getCountryCallingCode, type Country } from "react-phone-number-input";
import { AsYouType } from "libphonenumber-js";
import { FiChevronDown } from "react-icons/fi";

type CountryEntry = { code: Country; name: string; dialCode: string };

const COUNTRIES: CountryEntry[] = getCountries()
  .map((code) => ({
    code,
    name: new Intl.DisplayNames("es", { type: "region" }).of(code) ?? code,
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const dialCodeMap = new Map<string, CountryEntry>(COUNTRIES.map((c) => [c.dialCode, c]));
const countryCodeMap = new Map<Country, CountryEntry>(COUNTRIES.map((c) => [c.code, c]));

function countryByPrefix(value: string) {
  if (!value || !value.startsWith("+")) return undefined;
  for (let len = 4; len >= 2; len--) {
    const c = dialCodeMap.get(value.slice(0, len));
    if (c) return c;
  }
  return undefined;
}

const COMMON_CODES: Country[] = [
  "ES", "US", "MX", "AR", "CO", "CL", "PE",
  "VE", "EC", "CU", "DO", "GT", "UY", "CR", "PA",
];
const COMMON: CountryEntry[] = COMMON_CODES
  .map((code) => countryCodeMap.get(code))
  .filter((c): c is CountryEntry => c != null);

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PLACEHOLDER: Partial<Record<Country, string>> = {
  ES: "612 34 56 78",
  US: "(212) 555-0198",
  MX: "55 1234 5678",
  AR: "011 1234-5678",
  CO: "312 345 67 89",
  CL: "9 1234 5678",
  PE: "987 654 321",
  VE: "0412 345 67 89",
  EC: "099 123 4567",
  DO: "809 123 4567",
  GT: "1234 5678",
  UY: "091 234 567",
  CR: "8811 2233",
  PA: "6123 4567",
};

export function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [countryCode, setCountryCode] = useState<Country>(() => {
    const c = value ? countryByPrefix(value) : undefined;
    return c?.code ?? "ES";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const c = value ? countryByPrefix(value) : undefined;
    if (c && c.code !== countryCode) setCountryCode(c.code);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedCountry = countryCodeMap.get(countryCode) ?? COUNTRIES[0];
  const dialCode = selectedCountry.dialCode;
  const localDigits = value.startsWith(dialCode) ? value.slice(dialCode.length) : (value ?? "");

  const displayValue = useMemo(() => {
    if (!localDigits) return "";
    const formatted = new AsYouType(countryCode).input(localDigits);
    if (!formatted && focused) return localDigits;
    if (!formatted) return "";
    return formatted;
  }, [localDigits, countryCode, focused]);

  const placeholder = PLACEHOLDER[countryCode] ?? "612 34 56 78";

  const filtered = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    const common = COMMON.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
    const rest = COUNTRIES.filter(
      (c) =>
        !COMMON_CODES.includes(c.code) &&
        (c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q)),
    );
    return { common, rest };
  }, [search]);

  function selectCountry(code: Country) {
    const c = countryCodeMap.get(code);
    if (!c) return;
    const newLocal = value.startsWith(dialCode) ? value.slice(dialCode.length) : (value ?? "");
    onChange(`${c.dialCode}${newLocal.replace(/[^0-9]/g, "")}`);
    setCountryCode(code);
    setOpen(false);
    setSearch("");
    inputRef.current?.focus();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cursorPos = e.target.selectionStart ?? 0;
    const digitsBeforeCursor = (e.target.value.slice(0, cursorPos).match(/\d/g) ?? []).length;
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    onChange(`${dialCode}${digitsOnly}`);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const val = inputRef.current.value;
      const totalDigits = (val.match(/\d/g) ?? []).length;

      if (digitsBeforeCursor >= totalDigits) {
        inputRef.current.setSelectionRange(val.length, val.length);
        return;
      }
      let count = 0;
      for (let i = 0; i < val.length; i++) {
        if (/\d/.test(val[i])) count++;
        if (count === digitsBeforeCursor) {
          inputRef.current.setSelectionRange(i + 1, i + 1);
          return;
        }
      }
      inputRef.current.setSelectionRange(val.length, val.length);
    });
  }

  function renderCountryItem(c: CountryEntry) {
    return (
      <button
        key={c.code}
        type="button"
        onClick={() => selectCountry(c.code)}
        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition hover:bg-gray-100 dark:hover:bg-white/8 cursor-pointer ${
          selectedCountry.code === c.code
            ? "bg-primary/10 font-medium text-primary"
            : "text-gray-900 dark:text-white"
        }`}
      >
        <Flag code={c.code} />
        <span className="flex-1">{c.name}</span>
        <span className="text-gray-400 dark:text-white/40">{c.dialCode}</span>
      </button>
    );
  }

  return (
    <div className={`relative flex ${className}`}>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-full items-center gap-1.5 rounded-l-lg border border-r-0 border-border bg-background/60 px-2.5 py-2.5 text-sm text-gray-900 outline-none transition hover:bg-gray-50 dark:text-white dark:bg-white/4 dark:hover:bg-white/8 cursor-pointer"
        >
          <Flag code={selectedCountry.code} />
          <span className="text-xs text-gray-500 dark:text-white/45">
            {selectedCountry.dialCode}
          </span>
          <FiChevronDown size={12} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-72 overflow-auto rounded-lg border border-border bg-white p-1 shadow-lg dark:bg-gray-900 dark:border-white/10">
            <input
              placeholder="Buscar país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sticky top-0 z-10 mb-1 w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none shadow-sm focus:border-primary dark:bg-gray-900 dark:text-white"
            />

            {filtered ? (
              filtered.common.length === 0 && filtered.rest.length === 0 ? (
                <p className="p-2 text-xs text-gray-500">Sin resultados</p>
              ) : (
                [...filtered.common, ...filtered.rest].map(renderCountryItem)
              )
            ) : (
              <>
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35">
                  Más usados
                </p>
                {COMMON.map(renderCountryItem)}
                <div className="my-1 border-t border-border dark:border-white/8" />
                <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35">
                  Todos los países
                </p>
                {COUNTRIES.filter((c) => !COMMON_CODES.includes(c.code)).map(renderCountryItem)}
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="tel"
        className="min-w-0 flex-1 rounded-r-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/4 dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );
}

function Flag({ code }: { code: string }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
      alt={code}
      className="inline-block h-[18px] w-[24px] shrink-0 rounded-sm object-cover"
      loading="lazy"
    />
  );
}
