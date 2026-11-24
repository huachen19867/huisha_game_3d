(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D;
    class ThreeMemoryJournal {
        constructor(options) { Object.assign(this, options); }
        appendLinks(container) {
            const visited = Object.entries(game.MEMORY_CASES).filter(([id]) => this.story.state.records.some(record =>
                game.WORLD_MAP.interactables.find(item => item.id === record)?.deduction === id));
            if (!visited.length) return;
            const section = document.createElement('section'); section.className = 'memory-links';
            const title = document.createElement('h3'); title.textContent = copyText('memoryjournal.appendlinks'); section.append(title);
            for (const [id] of visited) {
                const button = document.createElement('button');
                button.textContent = `${this.story.state.deductions[id] ? copyText('memoryjournal.appendlinks.2') : copyText('memoryjournal.appendlinks.3')} · ${game.MEMORIES[id].title}`;
                button.addEventListener('click', () => this.show(id)); section.append(button);
            }
            container.append(section);
        }
        show(id) {
            const definition = game.MEMORY_CASES[id];
            if (!definition) return;
            const actions = [[copyText('memoryjournal.show'), this.close], [copyText('memoryjournal.show.2'), this.journal]];
            if (this.story.state.memory) actions.push([copyText('memoryjournal.show.3'), this.onReturn]);
            if (this.story.state.deductions[id]) {
                this.open(definition.title, this.story.conclusionFor(id), actions, copyText('memoryjournal.show.4'));
                const container = document.getElementById('reader-body');
                const originals=[...definition.records];
                if (id === 'hospital') originals.push('hospital_fare');
                if (id === 'crash') originals.push('bridge_driver_time');
                if(id==='school' && this.story.hasDocumentFace('school_draft','front')) originals.push('school_draft');
                for (const record of this.knownRecords().filter(record => originals.includes(record.id))) {
                    const detail = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
                    detail.className = 'record'; summary.textContent = record.title; text.textContent = record.text;
                    detail.append(summary, text); container.append(detail);
                }
                return;
            }
            let submit;
            this.open(definition.title, copyText('memoryjournal.show.5'),
                [[copyText('memoryjournal.show.6'), () => submit()], ...actions], copyText('memoryjournal.show.7'));
            const container = document.getElementById('reader-body'), form = document.createElement('div'); form.className = 'memory-draft';
            const draft = this.story.state.drafts[id] || { evidence: ['', ''], interpretation: null, timeline: [] };
            if (draft.questionChanged) {
                const note = document.createElement('p'); note.className = 'memory-question-update';
                note.textContent = copyText('memoryjournal.show.8'); container.append(note);
            }
            const records = this.knownRecords(), selectors = [], quotes = [];
            const option = (value, label) => { const element = document.createElement('option'); element.value = value; element.textContent = label; return element; };
            for (let index = 0; index < 2; index++) {
                const label = document.createElement('label'); label.textContent = index ? copyText('memoryjournal.show.9') : copyText('memoryjournal.show.10');
                const select = document.createElement('select'); select.append(option('', copyText('memoryjournal.show.11')));
                records.forEach(record => select.append(option(record.id, `${record.title}${record.location ? ` · ${record.location}` : ''}`)));
                select.value = draft.evidence[index]; selectors.push(select);
                const quote = document.createElement('p'); quote.className = 'memory-quote';
                const update = () => { quote.textContent = records.find(record => record.id === select.value)?.text || copyText('memoryjournal.show.12'); };
                quotes.push(update);
                select.addEventListener('change', () => { update(); saveDraft(); }); update();
                label.append(select); form.append(label, quote);
            }
            const label = document.createElement('label'); label.textContent = copyText('memoryjournal.show.13');
            const interpretation = document.createElement('select'); interpretation.append(option('', copyText('memoryjournal.show.14')));
            const choices=definition.preliminaryChoices && !definition.facts.every(fact=>this.story.knowsFact(fact))
                ? definition.preliminaryChoices : definition.choices;
            choices.forEach((choice, index) => interpretation.append(option(String(index), choice)));
            interpretation.value = draft.interpretation === null ? '' : String(draft.interpretation);
            label.append(interpretation); form.append(label);
            const status = document.createElement('p'); status.className = 'memory-feedback'; status.setAttribute('role', 'status'); form.append(status);
            let timeline;
            const saveDraft = order => {
                this.story.setMemoryDraft(id, selectors.map(select => select.value), interpretation.value === '' ? null : Number(interpretation.value),
                    Array.isArray(order) ? order : this.story.state.drafts[id]?.timeline);
                if (!this.story.state.drafts[id]?.questionChanged) container.querySelector('.memory-question-update')?.remove();
                timeline?.refresh();
            };
            timeline = new game.ThreeMemoryTimeline({ id, definition, story: this.story, records,
                getEvidence: () => selectors.map(select => select.value), onChange: saveDraft, onFeedback: message => { status.textContent = message; } });
            timeline.mount(form, label);
            const pins = this.story.state.pinnedRecords;
            if (pins.length === 2 && pins.every(pin => records.some(record => record.id === pin))) {
                const usePins = document.createElement('button'); usePins.type = 'button'; usePins.className = 'memory-use-pins';
                usePins.textContent = copyText('memoryjournal.show.15');
                usePins.addEventListener('click', () => {
                    selectors.forEach((select, index) => { select.value = pins[index]; quotes[index](); });
                    saveDraft(); status.textContent = copyText('memoryjournal.show.16');
                });
                form.prepend(usePins);
            }
            interpretation.addEventListener('change', saveDraft);
            submit = () => {
                saveDraft(); const result = this.story.deduce(id);
                if (result.success) { this.onSolved(); this.show(id); }
                else status.textContent = result.message;
            };
            container.append(form);
        }
    }
    game.ThreeMemoryJournal = ThreeMemoryJournal;
})(window);
