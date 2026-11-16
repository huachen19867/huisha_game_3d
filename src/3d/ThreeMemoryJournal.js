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
                this.open(definition.title, definition.conclusion, actions, '已经核对的记忆');
                const container = document.getElementById('reader-body');
                for (const record of this.knownRecords().filter(record => definition.records.includes(record.id))) {
                    const detail = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p');
                    detail.className = 'record'; summary.textContent = record.title; text.textContent = record.text;
                    detail.append(summary, text); container.append(detail);
                }
                return;
            }
            let submit;
            this.open(definition.title, '把两份已经观察过的原文放在一起，再选出你认为成立的解释。错误尝试不会清空草稿。',
                [['提交推理', () => submit()], ...actions], '只用你亲眼见到的记录');
            const container = document.getElementById('reader-body'), form = document.createElement('div'); form.className = 'memory-draft';
            const draft = this.story.state.drafts[id] || { evidence: ['', ''], interpretation: null };
            const records = this.knownRecords(), selectors = [];
            const option = (value, label) => { const element = document.createElement('option'); element.value = value; element.textContent = label; return element; };
            for (let index = 0; index < 2; index++) {
                const label = document.createElement('label'); label.textContent = index ? '第二份原文' : '第一份原文';
                const select = document.createElement('select'); select.append(option('', '选择一份已读记录'));
                records.forEach(record => select.append(option(record.id, `${record.title}${record.location ? ` · ${record.location}` : ''}`)));
                select.value = draft.evidence[index]; selectors.push(select);
                const quote = document.createElement('p'); quote.className = 'memory-quote';
                const update = () => { quote.textContent = records.find(record => record.id === select.value)?.text || '尚未选择原文。可以先保留草稿，回现场观察。'; };
                select.addEventListener('change', () => { update(); saveDraft(); }); update();
                label.append(select); form.append(label, quote);
            }
            const label = document.createElement('label'); label.textContent = '你的解释';
            const interpretation = document.createElement('select'); interpretation.append(option('', '选择一个解释'));
            definition.choices.forEach((choice, index) => interpretation.append(option(String(index), choice)));
            interpretation.value = draft.interpretation === null ? '' : String(draft.interpretation);
            label.append(interpretation); form.append(label);
            const status = document.createElement('p'); status.className = 'memory-feedback'; status.setAttribute('role', 'status'); form.append(status);
            const saveDraft = () => this.story.setMemoryDraft(id, selectors.map(select => select.value), interpretation.value === '' ? null : Number(interpretation.value));
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
