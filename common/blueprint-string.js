function decodeBlueprintString(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid blueprint string');
    }

    const trimmed = input.trim();
    if (!trimmed) {
        throw new Error('Blueprint string is empty');
    }

    const withoutPrefix = trimmed.substring(1);

    let binaryString;
    try {
        binaryString = atob(withoutPrefix);
    } catch (e) {
        throw new Error('Blueprint string is not valid base64');
    }

    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    let decompressed;
    try {
        decompressed = pako.inflate(bytes, { to: 'string' });
    } catch (e) {
        throw new Error('Failed to decompress blueprint payload');
    }

    try {
        return JSON.parse(decompressed);
    } catch (e) {
        throw new Error('Blueprint JSON is invalid');
    }
}

function encodeBlueprintData(blueprintData) {
    if (!blueprintData) {
        throw new Error('No blueprint data to encode');
    }

    const jsonString = JSON.stringify(blueprintData);
    const compressed = pako.deflate(jsonString);
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    return '0' + base64;
}

