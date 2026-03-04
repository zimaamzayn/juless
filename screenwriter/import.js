const Import = (() => {
    const fromJSON = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const script = JSON.parse(e.target.result);
                    resolve(script);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    };

    const fromText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n');
                let html = '';

                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return;

                    let type = 'action';
                    if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.')) {
                        type = 'scene-heading';
                    } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 30) {
                        type = 'character';
                    } else if (line.startsWith('     ')) {
                        type = 'dialogue';
                    }

                    html += `<div class="element ${type}" data-type="${type}">${trimmed}</div>`;
                });

                resolve(html);
            };
            reader.readAsText(file);
        });
    };

    return {
        fromJSON,
        fromText
    };
})();
