(function (global) {
    const game = global.Huisha3D;
    class ThreeEvidenceJournal {
        constructor({ story, knownRecords }) { Object.assign(this, { story, knownRecords }); }
        location(record) {
            return record.location || (['lock', 'wall_marks', 'threshold'].includes(record.id) ? '走廊' : '正厅');
        }
        appendPinAction(container, id) {
            if (!this.story.state.records.includes(id)) return;
            const button = document.createElement('button'); button.type = 'button'; button.dataset.pinRecord = id;
            button.addEventListener('click', () => {
                this.story.togglePin(id); this.sync();
            });
            container.append(button); this.updateButton(button);
        }
        updateButton(button) {
            const pinned = this.story.state.pinnedRecords.includes(button.dataset.pinRecord);
            button.setAttribute('aria-pressed', String(pinned));
            button.textContent = pinned ? '移出摘记' : '放入摘记';
            button.disabled = !pinned && this.story.state.pinnedRecords.length >= 2;
            button.title = button.disabled ? '摘记已满，先移除其中一份再放入新记录' : '';
        }
        comparison(container, compact = false) {
            container.replaceChildren();
            const records = this.knownRecords(), pinned = this.story.state.pinnedRecords.map(id => records.find(record => record.id === id)).filter(Boolean);
            if (!pinned.length) {
                const empty = document.createElement('p'); empty.className = 'evidence-empty';
                empty.textContent = compact ? '在原文或手记中选择“放入摘记”，就能在操作机关时回看。'
                    : '可以选两份原文放在一起对照。摘记也会留在字轮和量水桌旁；选取不代表推理已完成。';
                container.append(empty); return;
            }
            for (const record of pinned) {
                const card = document.createElement('article'); card.className = 'evidence-card'; card.dataset.pinnedRecord = record.id;
                const title = document.createElement('h4'); title.textContent = record.title;
                const location = document.createElement('small'); location.textContent = this.location(record);
                const text = document.createElement('p'); text.textContent = record.text;
                const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '移除';
                remove.setAttribute('aria-label', `移除摘记：${record.title}`);
                remove.addEventListener('click', () => {
                    this.story.togglePin(record.id); this.sync();
                    // The removed card no longer owns a focus target. Keep keyboard focus in this view.
                    const target = container.querySelector('button') || container.closest('details')?.querySelector('summary')
                        || container.closest('.evidence-journal')?.querySelector('select');
                    target?.focus({ preventScroll: true });
                });
                card.append(title, location, text, remove); container.append(card);
            }
        }
        sync() {
            document.querySelectorAll('[data-pin-record]').forEach(button => this.updateButton(button));
            document.querySelectorAll('[data-evidence-comparison]').forEach(container => this.comparison(container, container.dataset.evidenceComparison === 'compact'));
            document.querySelectorAll('[data-evidence-count]').forEach(element => { element.textContent = `随手摘记 · ${this.story.state.pinnedRecords.length} / 2`; });
        }
        mountInspector(container) {
            const details = document.createElement('details'); details.className = 'inspection-notes';
            const summary = document.createElement('summary'); summary.dataset.evidenceCount = '';
            const content = document.createElement('div'); content.dataset.evidenceComparison = 'compact'; content.className = 'inspection-notes-body';
            details.append(summary, content); container.append(details); this.sync();
        }
        append(container) {
            const records = this.knownRecords(), root = document.createElement('section'); root.className = 'evidence-journal';
            const heading = document.createElement('h3'); heading.dataset.evidenceCount = '';
            const compare = document.createElement('div'); compare.className = 'evidence-comparison';
            compare.dataset.evidenceComparison = ''; compare.setAttribute('aria-label', '两份原文对照');
            const instruction = document.createElement('p'); instruction.className = 'evidence-instruction';
            instruction.textContent = '摘记最多保留两份。要换一份，先移除已有摘记。';
            root.append(heading, compare, instruction);
            if (!records.length) {
                const empty = document.createElement('p'); empty.textContent = '尚未记下观察。看向旧宅中的器物，靠近后调查。';
                root.append(empty); container.append(root); this.sync(); return;
            }
            const label = document.createElement('label'); label.className = 'evidence-filter'; label.textContent = '翻看哪一处';
            const select = document.createElement('select');
            const scopes = [...new Set(records.map(record => record.space || 'house'))];
            for (const scope of ['all', ...scopes]) {
                const option = document.createElement('option'); option.value = scope;
                const count = scope === 'all' ? records.length : records.filter(record => (record.space || 'house') === scope).length;
                option.textContent = `${scope === 'all' ? '全部记录' : scope === 'house' ? '老宅与雨庭' : game.MEMORIES[scope].title} · ${count} 份`;
                select.append(option);
            }
            const current = this.story.state.memory || 'house'; select.value = scopes.includes(current) ? current : 'all';
            const list = document.createElement('div'); list.className = 'evidence-records';
            const render = () => {
                list.replaceChildren(); const groups = new Map();
                for (const record of [...records].reverse()) {
                    if (select.value !== 'all' && (record.space || 'house') !== select.value) continue;
                    const location = this.location(record);
                    if (!groups.has(location)) groups.set(location, []);
                    groups.get(location).push(record);
                }
                for (const [location, entries] of groups) {
                    const section = document.createElement('section'); section.className = 'evidence-location';
                    const title = document.createElement('h3'); title.textContent = location; section.append(title);
                    for (const record of entries) {
                        const detail = document.createElement('details'); detail.className = 'record'; detail.dataset.record = record.id;
                        const summary = document.createElement('summary'); summary.textContent = record.title;
                        const content = document.createElement('p'); content.textContent = record.text;
                        detail.append(summary, content); this.appendPinAction(detail, record.id); section.append(detail);
                    }
                    list.append(section);
                }
            };
            select.addEventListener('change', render); label.append(select); root.append(label, list); container.append(root);
            render(); this.sync();
        }
    }
    game.ThreeEvidenceJournal = ThreeEvidenceJournal;
})(window);
