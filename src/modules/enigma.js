/**
 * Simulasi Mesin Enigma M3 (Wehrmacht / Kriegsmarine)
 * Fitur Bonus 1 Sesuai Spesifikasi Tugas UTS Kriptografi
 * Penanggung Jawab: Andi Rafiyan (237006074)
 */

export const ROTOR_DEFINITIONS = {
    "I":   { wiring: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
    "II":  { wiring: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
    "III": { wiring: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" },
    "IV":  { wiring: "ESOVPZJAYQUIRHXMJLXDTKFBW", notch: "J" },
    "V":   { wiring: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: "Z" }
};

export const REFLECTOR_DEFINITIONS = {
    "B": "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    "C": "FVPJIAOYEDRZXWGCTKUQSBNMHL"
};

/**
 * Konversi karakter A-Z ke angka 0-25
 * @param {string} ch 
 * @returns {number}
 */
function charToNum(ch) {
    return ch.charCodeAt(0) - 65;
}

/**
 * Konversi angka 0-25 ke karakter A-Z
 * @param {number} num 
 * @returns {string}
 */
function numToChar(num) {
    return String.fromCharCode(((num % 26) + 26) % 26 + 65);
}

export class EnigmaM3 {
    /**
     * @param {Object} config
     * @param {string[]} config.rotors - Array 3 nama rotor, e.g. ["I", "II", "III"] (Left, Middle, Right)
     * @param {string} config.reflector - "B" atau "C"
     * @param {string} [config.positions="AAA"] - Posisi awal rotor (Left, Middle, Right)
     * @param {string} [config.rings="AAA"] - Ring setting / Ringstellung
     * @param {string[]} [config.plugboard=[]] - Pasangan plugboard, e.g. ["AB", "CD"]
     */
    constructor(config = {}) {
        const rotorNames = config.rotors || ["I", "II", "III"];
        this.leftRotorName = rotorNames[0] || "I";
        this.middleRotorName = rotorNames[1] || "II";
        this.rightRotorName = rotorNames[2] || "III";

        this.leftWiring = ROTOR_DEFINITIONS[this.leftRotorName].wiring;
        this.leftNotch = ROTOR_DEFINITIONS[this.leftRotorName].notch;

        this.middleWiring = ROTOR_DEFINITIONS[this.middleRotorName].wiring;
        this.middleNotch = ROTOR_DEFINITIONS[this.middleRotorName].notch;

        this.rightWiring = ROTOR_DEFINITIONS[this.rightRotorName].wiring;
        this.rightNotch = ROTOR_DEFINITIONS[this.rightRotorName].notch;

        const reflName = config.reflector || "B";
        this.reflectorWiring = REFLECTOR_DEFINITIONS[reflName] || REFLECTOR_DEFINITIONS["B"];

        const pos = (config.positions || "AAA").toUpperCase();
        this.posLeft = charToNum(pos[0] || "A");
        this.posMiddle = charToNum(pos[1] || "A");
        this.posRight = charToNum(pos[2] || "A");

        const rings = (config.rings || "AAA").toUpperCase();
        this.ringLeft = charToNum(rings[0] || "A");
        this.ringMiddle = charToNum(rings[1] || "A");
        this.ringRight = charToNum(rings[2] || "A");

        // Plugboard map
        this.plugboard = new Map();
        if (Array.isArray(config.plugboard)) {
            for (const pair of config.plugboard) {
                const p = pair.toUpperCase().replace(/[^A-Z]/g, "");
                if (p.length === 2) {
                    this.plugboard.set(p[0], p[1]);
                    this.plugboard.set(p[1], p[0]);
                }
            }
        }
    }

    /**
     * Terapkan swap Plugboard (Steckerbrett)
     * @param {string} ch 
     * @returns {string}
     */
    applyPlugboard(ch) {
        return this.plugboard.get(ch) || ch;
    }

    /**
     * Mekanisme langkah rotor mekanik (Stepping & Double-Stepping Anomaly)
     * Terjadi SEBELUM arus listrik melintasi rotor saat tombol ditekan.
     */
    stepRotors() {
        const rightAtNotch = numToChar(this.posRight) === this.rightNotch;
        const middleAtNotch = numToChar(this.posMiddle) === this.middleNotch;

        // Double-stepping: Jika rotor tengah berada pada notch-nya, ia melangkah lagi
        // dan memutar rotor kiri
        if (middleAtNotch) {
            this.posMiddle = (this.posMiddle + 1) % 26;
            this.posLeft = (this.posLeft + 1) % 26;
        } else if (rightAtNotch) {
            // Rotor kanan mencapai notch -> majukan rotor tengah
            this.posMiddle = (this.posMiddle + 1) % 26;
        }

        // Rotor kanan selalu melangkah pada setiap penekanan tombol
        this.posRight = (this.posRight + 1) % 26;
    }

    /**
     * Lintasan sinyal maju melewati sebuah rotor
     * @param {number} inputNum (0-25)
     * @param {string} wiring 
     * @param {number} pos 
     * @param {number} ring 
     * @returns {number}
     */
    rotorForward(inputNum, wiring, pos, ring) {
        const offset = (pos - ring + 26) % 26;
        const enteredPin = (inputNum + offset) % 26;
        const mappedChar = wiring[enteredPin];
        const outputNum = (charToNum(mappedChar) - offset + 26) % 26;
        return outputNum;
    }

    /**
     * Lintasan sinyal mundur melewati sebuah rotor (setelah memantul dari reflektor)
     * @param {number} inputNum (0-25)
     * @param {string} wiring 
     * @param {number} pos 
     * @param {number} ring 
     * @returns {number}
     */
    rotorBackward(inputNum, wiring, pos, ring) {
        const offset = (pos - ring + 26) % 26;
        const enteredPin = (inputNum + offset) % 26;
        const enteredChar = numToChar(enteredPin);
        const mappedPin = wiring.indexOf(enteredChar);
        const outputNum = (mappedPin - offset + 26) % 26;
        return outputNum;
    }

    /**
     * Proses enkripsi/dekripsi untuk 1 karakter alfabet
     * @param {string} ch 
     * @returns {string}
     */
    processChar(ch) {
        const upper = ch.toUpperCase();
        if (upper < "A" || upper > "Z") return "";

        // 1. Rotor melangkah sebelum sinyal listrik mengalir
        this.stepRotors();

        // 2. Masuk Plugboard
        let current = this.applyPlugboard(upper);
        let signal = charToNum(current);

        // 3. Arus Maju (Forward): Kanan -> Tengah -> Kiri
        signal = this.rotorForward(signal, this.rightWiring, this.posRight, this.ringRight);
        signal = this.rotorForward(signal, this.middleWiring, this.posMiddle, this.ringMiddle);
        signal = this.rotorForward(signal, this.leftWiring, this.posLeft, this.ringLeft);

        // 4. Memantul di Reflektor (UKW)
        const reflectedChar = this.reflectorWiring[signal];
        signal = charToNum(reflectedChar);

        // 5. Arus Mundur (Backward): Kiri -> Tengah -> Kanan
        signal = this.rotorBackward(signal, this.leftWiring, this.posLeft, this.ringLeft);
        signal = this.rotorBackward(signal, this.middleWiring, this.posMiddle, this.ringMiddle);
        signal = this.rotorBackward(signal, this.rightWiring, this.posRight, this.ringRight);

        // 6. Keluar Plugboard menuju Lampboard
        const outChar = numToChar(signal);
        return this.applyPlugboard(outChar);
    }

    /**
     * Memproses teks secara utuh
     * @param {string} text 
     * @returns {string}
     */
    processText(text) {
        let result = "";
        const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
        for (const ch of clean) {
            result += this.processChar(ch);
        }
        return result;
    }
}

/**
 * Helper fungsional sesuai kontrak antarmuka
 * @param {string} text 
 * @param {Object} config 
 * @returns {string}
 */
export function processEnigma(text, config) {
    const machine = new EnigmaM3(config);
    return machine.processText(text);
}
