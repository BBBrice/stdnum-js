/**
 * NRT (Número de Registre Tributari, Andorra tax number).
 *
 * The Número de Registre Tributari (NRT) is an identifier of legal and natural
 * entities for tax purposes.
 *
 * This number consists of one letter indicating the type of entity, then 6
 * digits, followed by a check letter.
 *
 * More information:
 *    https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/Andorra-TIN.pdf
 *
 * NRT == VAT
 */

import * as exceptions from "../exceptions";
import { isalpha, isdigits, cleanUnicode, formatPattern } from "../util";
import { Validator, ValidateReturn } from "../types";

function clean(input: string): ReturnType<typeof cleanUnicode> {
  return cleanUnicode(input, " -.");
}

class NrtSingleton implements Validator {
  compact(input: string): string {
    const [value, err] = clean(input);

    if (err) {
      throw err;
    }

    return value.toLocaleUpperCase();
  }

  format(input: string): string {
    const value = this.compact(input);

    return formatPattern("?-??????-?", value);
  }

  /**
   * Check if the number is a valid Andorra NRT number.
   * This checks the length, formatting and other contraints. It does not check
   * for control letter.
   */
  validate(value: string): ValidateReturn {
    const [v, error] = clean(value);

    if (error) {
      return { isValid: false, error };
    }
    if (v.length != 8) {
      return { isValid: false, error: new exceptions.InvalidLength() };
    }

    const mid = v.substr(1, v.length - 2);

    if (!isalpha(v[0]) || !isalpha(v[v.length - 1])) {
      return { isValid: false, error: new exceptions.InvalidFormat() };
    }
    if (!isdigits(mid)) {
      return { isValid: false, error: new exceptions.InvalidFormat() };
    }
    if (!"ACDEFGLOPU".includes(v[0])) {
      return { isValid: false, error: new exceptions.InvalidComponent() };
    }
    if (v[0] === "F" && mid > "699999") {
      return { isValid: false, error: new exceptions.InvalidComponent() };
    }
    if ("AL".includes(v[0]) && mid > "699999" && mid < "800000") {
      return { isValid: false, error: new exceptions.InvalidComponent() };
    }

    return {
      isValid: true,
      compact: v,
      isIndividual: "AF".includes(v[0]),
      isCompany: !"AF".includes(v[0]),
    };
  }
}

export const Nrt = new NrtSingleton();
export const validate = Nrt.validate;
export const format = Nrt.format;
export const compact = Nrt.compact;