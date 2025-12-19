// --- MAGIC TRANSLATION / TRANSLITERATION ---
export const performMagic = async (text) => {
    if (!text) return "";
    // Detect if text contains English characters
    const isEnglish = /[a-zA-Z]/.test(text);
    
    try {
      if (isEnglish) {
        // Transliterate English to Hindi (e.g. "Ram" -> "राम")
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[1] && data[1][0] && data[1][0][1]) {
            return data[1][0][1][0];
        }
      } else {
        // Translate Hindi to English
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
      }
    } catch (error) { 
        console.error("Magic API Error:", error); 
        // Fail silently and return original text if offline
        return text; 
    }
    return text;
};

// --- DATE FORMATTER ---
export const formatDate = (isoString) => {
    if (!isoString) return "";
    const [y, m, d] = isoString.split('-');
    return `${d}/${m}`;
};