const Export = (() => {
    const toJSON = (script) => {
        const blob = new Blob([JSON.stringify(script, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${script.title}.json`);
    };

    const toText = (title, contentHtml) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;
        const elements = tempDiv.querySelectorAll('.element');
        let text = `${title.toUpperCase()}\n\n`;

        elements.forEach(el => {
            const type = el.dataset.type;
            const content = el.textContent.trim();

            switch (type) {
                case 'scene-heading':
                    text += `\n${content.toUpperCase()}\n\n`;
                    break;
                case 'character':
                    text += `\n          ${content.toUpperCase()}\n`;
                    break;
                case 'dialogue':
                    text += `     ${content}\n`;
                    break;
                case 'parenthetical':
                    text += `        (${content})\n`;
                    break;
                case 'transition':
                    text += `\n${content.toUpperCase().padStart(60)}\n`;
                    break;
                default:
                    text += `${content}\n\n`;
            }
        });

        const blob = new Blob([text], { type: 'text/plain' });
        downloadBlob(blob, `${title}.txt`);
    };

    const toPDF = () => {
        window.print();
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        toJSON,
        toText,
        toPDF
    };
})();
