(function (global) {
    const game = global.Huisha3D;
    class ThreeMemoryJournal {
        constructor(options) { Object.assign(this, options); }
        appendLinks(container) {
            const visited = Object.entries(game.MEMORY_CASES).filter(([id]) => this.story.state.records.some(record =>
                game.WORLD_MAP.interactables.find(item => item.id === record)?.deduction === id));
            if (!visited.length) return;
            const section = document.createElement('section'); section.className = 'memory-links';
            const title = document.createElement('h3'); title.textContent = '整理记忆'; section.append(title);
            for (const [id] of visited) {
                const button = document.createElement('button');
                button.textContent = `${this.story.state.deductions[id] ? '回看判断' : '整理'} · ${game.MEMORIES[id].title}`;
                button.addEventListener('click', () => this.show(id)); section.append(button);
            }
            container.append(section);
        }
        show(id) {
            const definition = game.MEMORY_CASES[id];
            if (!definition) return;
            const actions = [['继续观察', this.close], ['回查手记', this.journal]];
            if (this.story.state.memory) actions.push(['回到厨房', this.onReturn]);
            if (this.story.state.deductions[id]) {
                this.open(definition.title, this.story.conclusionFor(id), actions, '已经核对的记忆');
                const container = document.getElementById('reader-body');
                const originals=[...definition.records];
                if(id==='school' && this.story.hasDocumentFace('school_draft','front')) originals.push('school_draft');
                for (const record of this.knownRecords().filter(record => originals.includes(record.id))) {
                    const detail = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
                    detail.className = 'record'; summary.textContent = record.title; text.textContent = record.text;
                    detail.append(summary, text); container.append(detail);
                }
                return;
            }
            let submit;
            this.open(definition.title, '这两份记录能确认什么？对照已读原文，按日期排列，再选择与原文相符的判断。错误尝试不会清空草稿。',
                [['提交推理', () => submit()], ...actions], '只用你亲眼见到的记录');
            const container = document.getElementById('reader-body'), form = document.createElement('div'); form.className = 'memory-draft';
            const draft = this.story.state.drafts[id] || { evidence: ['', ''], interpretation: null, timeline: [] };
            if (draft.questionChanged) {
                const note = document.createElement('p'); note.className = 'memory-question-update';
                note.textContent = '核对问题已更新。原文和时间线草稿保留，请重新选择判断。'; container.append(note);
            }
            const records = this.knownRecords(), selectors = [], quotes = [];
            const option = (value, label) => { const element = document.createElement('option'); element.value = value; element.textContent = label; return element; };
            for (let index = 0; index < 2; index++) {
                const label = document.createElement('label'); label.textContent = index ? '第二份原文' : '第一份原文';
                const select = document.createElement('select'); select.append(option('', '选择一份已读记录'));
                records.forEach(record => select.append(option(record.id, `${record.title}${record.location ? ` · ${record.location}` : ''}`)));
                select.value = draft.evidence[index]; selectors.push(select);
                const quote = document.createElement('p'); quote.className = 'memory-quote';
                const update = () => { quote.textContent = records.find(record => record.id === select.value)?.text || '尚未选择原文。可以先保留草稿，回现场观察。'; };
                quotes.push(update);
                select.addEventListener('change', () => { update(); saveDraft(); }); update();
                label.append(select); form.append(label, quote);
            }
            const label = document.createElement('label'); label.textContent = '与原文相符的判断';
            const interpretation = document.createElement('select'); interpretation.append(option('', '选择一个判断'));
            definition.choices.forEach((choice, index) => interpretation.append(option(String(index), choice)));
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
                usePins.textContent = '把两份摘记放入草稿';
                usePins.addEventListener('click', () => {
                    selectors.forEach((select, index) => { select.value = pins[index]; quotes[index](); });
                    saveDraft(); status.textContent = '已放入原文。还要排列时间线、选择解释，再主动提交。';
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
