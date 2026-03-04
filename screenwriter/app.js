const App = (() => {
    let currentScript = null;
    let autosaveTimer = null;
    let isModified = false;

    const init = async () => {
        // Initialize Modules
        await Storage.init();
        UI.init();
        Editor.init(document.getElementById('editor'), onEditorChange);
        Navigator.init();
        Stats.init();
        Shortcuts.init();

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(() => console.log('Service Worker Registered'))
                .catch(err => console.error('Service Worker registration failed', err));
        }

        // Event Listeners
        document.getElementById('btn-new').addEventListener('click', handleNewScript);
        document.getElementById('btn-open').addEventListener('click', showOpenDialog);
        document.getElementById('btn-import').addEventListener('click', showImportDialog);
        document.getElementById('btn-save').addEventListener('click', saveCurrentScript);
        document.getElementById('btn-search').addEventListener('click', showSearchDialog);
        document.getElementById('btn-export').addEventListener('click', showExportDialog);
        document.getElementById('btn-settings').addEventListener('click', showSettingsDialog);

        // Load Last Script or Create New
        const lastScript = await Storage.getLastModifiedScript();
        if (lastScript) {
            loadScript(lastScript);
        } else {
            createNewScript();
        }

        refreshScriptList();
    };

    const loadScript = (script) => {
        currentScript = script;
        Editor.setContent(script.content);
        UI.updateScriptTitle(script.title);
        UI.updateSyncStatus('Loaded');
        isModified = false;
        onEditorChange();
    };

    const handleNewScript = async () => {
        if (isModified) {
            if (confirm("You have unsaved changes. Do you want to save the current script before creating a new one?")) {
                await saveCurrentScript();
            }
        }
        createNewScript();
    };

    const createNewScript = async () => {
        const title = prompt("Enter script title:", "Untitled Script") || "Untitled Script";
        currentScript = await Storage.createNewScript(title);
        loadScript(currentScript);
        refreshScriptList();
    };

    const saveCurrentScript = async () => {
        if (!currentScript) return;

        currentScript.content = Editor.getContent();
        await Storage.saveScript(currentScript);
        UI.updateSyncStatus('Saved');
        isModified = false;
        refreshScriptList();
    };

    const onEditorChange = () => {
        const content = Editor.getContent();
        Navigator.update(content);
        Stats.update(content);

        UI.updateSyncStatus('Modified');
        isModified = true;

        // Autosave logic
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(saveCurrentScript, 3000);
    };

    const refreshScriptList = async () => {
        const scripts = await Storage.getAllScripts();
        UI.renderScriptList(scripts, (script) => {
            if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;
            loadScript(script);
        });
    };

    const showImportDialog = () => {
        const bodyHtml = `
            <div>
                <p>Import from JSON or TXT file:</p>
                <input type="file" id="import-file" accept=".json,.txt" style="margin-top:10px;">
            </div>
        `;
        UI.showModal("Import Script", bodyHtml, null);

        document.getElementById('import-file').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                let script;
                if (file.name.endsWith('.json')) {
                    script = await Import.fromJSON(file);
                    if (script.title && script.content) {
                        const newScript = await Storage.createNewScript(script.title);
                        newScript.content = script.content;
                        await Storage.saveScript(newScript);
                        loadScript(newScript);
                    }
                } else {
                    const content = await Import.fromText(file);
                    const newScript = await Storage.createNewScript(file.name.replace('.txt', ''));
                    newScript.content = content;
                    await Storage.saveScript(newScript);
                    loadScript(newScript);
                }
                refreshScriptList();
                UI.hideModal();
            } catch (err) {
                alert("Import failed: " + err.message);
            }
        });
    };

    const showOpenDialog = async () => {
        const scripts = await Storage.getAllScripts();
        let listHtml = '<div class="script-list-modal">';
        scripts.forEach(s => {
            listHtml += `<div class="script-item-modal" data-id="${s.id}" style="padding:10px; cursor:pointer; border-bottom:1px solid #ccc;">
                <strong>${s.title}</strong><br>
                <small>Modified: ${new Date(s.lastModified).toLocaleString()}</small>
            </div>`;
        });
        listHtml += '</div>';

        UI.showModal("Open Script", listHtml, null);

        document.querySelectorAll('.script-item-modal').forEach(el => {
            el.addEventListener('click', async () => {
                const id = el.dataset.id;
                const script = await Storage.getScript(id);
                if (isModified && !confirm("Unsaved changes will be lost. Continue?")) return;
                loadScript(script);
                UI.hideModal();
            });
        });
    };

    const showSearchDialog = () => {
        const bodyHtml = `
            <div>
                <input type="text" id="search-input" placeholder="Find text..." style="width:100%; padding:8px;">
                <div id="search-results" style="margin-top:10px; max-height:200px; overflow-y:auto;"></div>
            </div>
        `;
        UI.showModal("Search Script", bodyHtml, null);

        const input = document.getElementById('search-input');
        input.focus();
        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            const resultsEl = document.getElementById('search-results');
            resultsEl.innerHTML = '';

            if (!query) return;

            const elements = document.querySelectorAll('.element');
            elements.forEach((el, index) => {
                if (el.textContent.toLowerCase().includes(query)) {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.style.padding = '5px';
                    resultItem.style.cursor = 'pointer';
                    resultItem.style.borderBottom = '1px solid #eee';
                    resultItem.textContent = el.textContent.substring(0, 50) + '...';
                    resultItem.addEventListener('click', () => {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.backgroundColor = 'yellow';
                        setTimeout(() => el.style.backgroundColor = '', 2000);
                        UI.hideModal();
                    });
                    resultsEl.appendChild(resultItem);
                }
            });
        });
    };

    const showExportDialog = () => {
        const bodyHtml = `
            <div class="export-options">
                <button id="export-pdf" style="width:100%; margin-bottom:10px;">Export as PDF (Print)</button>
                <button id="export-json" style="width:100%; margin-bottom:10px;">Export as JSON</button>
                <button id="export-text" style="width:100%;">Export as TXT</button>
            </div>
        `;
        UI.showModal("Export Script", bodyHtml, null);

        document.getElementById('export-pdf').addEventListener('click', () => {
            Export.toPDF();
            UI.hideModal();
        });
        document.getElementById('export-json').addEventListener('click', () => {
            Export.toJSON(currentScript);
            UI.hideModal();
        });
        document.getElementById('export-text').addEventListener('click', () => {
            Export.toText(currentScript.title, currentScript.content);
            UI.hideModal();
        });
    };

    const showSettingsDialog = () => {
        const bodyHtml = `
            <div>
                <label>
                    <input type="checkbox" id="dark-mode-toggle" ${document.body.classList.contains('dark-mode') ? 'checked' : ''}> Dark Mode (Night Mode)
                </label>
                <br><br>
                <button id="btn-delete-current" style="background:red; color:white;">Delete Current Script</button>
            </div>
        `;
        UI.showModal("Settings", bodyHtml, null);

        document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });

        document.getElementById('btn-delete-current').addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this script?")) {
                await Storage.deleteScript(currentScript.id);
                currentScript = null;
                UI.hideModal();
                const nextScript = await Storage.getLastModifiedScript();
                if (nextScript) {
                    loadScript(nextScript);
                } else {
                    createNewScript();
                }
                refreshScriptList();
            }
        });
    };

    return {
        init,
        saveCurrentScript,
        refreshScriptList
    };
})();

window.addEventListener('DOMContentLoaded', App.init);
