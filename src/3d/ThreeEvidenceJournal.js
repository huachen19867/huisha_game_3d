(function (global) {
    const copyText=global.HuishaCopy;
    const game = global.Huisha3D;
    class ThreeEvidenceJournal {
        constructor({ story, knownRecords }) { Object.assign(this, { story, knownRecords }); }
        location(record) {
            return record.location || (['lock', 'wall_marks', 'threshold'].includes(record.id) ? copyText('evidencejournal.location') : copyText('evidencejournal.location.2'));
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
            button.textContent = pinned ? copyText('evidencejournal.updatebutton') : copyText('evidencejournal.updatebutton.2');
            button.disabled = !pinned && this.story.state.pinnedRecords.length >= 2;
            button.title = button.disabled ? copyText('evidencejournal.updatebutton.3') : '';
        }
        comparison(container, compact = false) {
            container.replaceChildren();
            const records = this.knownRecords(), pinned = this.story.state.pinnedRecords.map(id => records.find(record => record.id === id)).filter(Boolean);
            if (!pinned.length) {
                const empty = document.createElement('p'); empty.className = 'evidence-empty';
                empty.textContent = compact ? copyText('evidencejournal.comparison')
                    : copyText('evidencejournal.comparison.2');
                container.append(empty); return;
            }
            for (const record of pinned) {
                const card = document.createElement('article'); card.className = 'evidence-card'; card.dataset.pinnedRecord = record.id;
                const title = document.createElement('h4'); title.textContent = record.title;
                const location = document.createElement('small'); location.textContent = this.location(record);
                const text = document.createElement('p'); text.textContent = record.text;
                const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = copyText('evidencejournal.comparison.3');
                remove.setAttribute('aria-label', copyText('evidencejournal.comparison.4', record.title));
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
            document.querySelectorAll('[data-evidence-count]').forEach(element => { element.textContent = copyText('evidencejournal.sync', this.story.state.pinnedRecords.length); });
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
            compare.dataset.evidenceComparison = ''; compare.setAttribute('aria-label', copyText('evidencejournal.append'));
            const instruction = document.createElement('p'); instruction.className = 'evidence-instruction';
            instruction.textContent = copyText('evidencejournal.append.2');
            root.append(heading, compare, instruction);
            if (!records.length) {
                const empty = document.createElement('p'); empty.textContent = copyText('evidencejournal.append.3');
                root.append(empty); container.append(root); this.sync(); return;
            }
            const label = document.createElement('label'); label.className = 'evidence-filter'; label.textContent = copyText('evidencejournal.append.4');
            const select = document.createElement('select');
            const scopes = [...new Set(records.map(record => record.space || 'house'))];
            for (const scope of ['all', ...scopes]) {
                const option = document.createElement('option'); option.value = scope;
                const count = scope === 'all' ? records.length : records.filter(record => (record.space || 'house') === scope).length;
                option.textContent = copyText('evidencejournal.append.5', scope === 'all' ? copyText('evidencejournal.append.6') : scope === 'house' ? copyText('evidencejournal.append.7') : game.MEMORIES[scope].title, count);
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
