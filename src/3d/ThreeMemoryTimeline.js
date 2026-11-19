(function (global) {
    const copyText=global.HuishaCopy;
    class ThreeMemoryTimeline {
        constructor(options) { Object.assign(this, options); }
        mount(parent, before) {
            this.root = document.createElement('section'); this.root.className = 'memory-timeline-board';
            parent.insertBefore(this.root, before); this.refresh();
        }
        change(order, message, id, action) {
            this.onChange(order); this.onFeedback(message);
            const buttons = [...this.root.querySelectorAll('button')].filter(button => button.dataset.fact === id && !button.disabled);
            const target = buttons.find(button => button.dataset.action === action) || buttons[0] || this.root.querySelector('h3');
            target?.focus({ preventScroll: true });
        }
        refresh() {
            if (!this.root) return;
            this.root.replaceChildren(); const evidence = this.getEvidence();
            const facts = this.definition.facts.filter(fact => this.story.knowsFact(fact));
            const order = this.story.state.drafts[this.id]?.timeline || [];
            const heading = document.createElement('h3'); heading.textContent = copyText('memorytimeline.refresh'); heading.tabIndex = -1;
            const help = document.createElement('p'); help.className = 'memory-timeline-help';
            help.textContent = copyText('memorytimeline.refresh.2');
            const list = document.createElement('ol'); list.className = 'memory-timeline'; list.setAttribute('aria-label', copyText('memorytimeline.refresh.3'));
            this.root.append(heading, help, list);
            const button = (parent, fact, action, text, callback, disabled = false) => {
                const element = document.createElement('button'); element.type = 'button'; element.dataset.fact = fact.id; element.dataset.action = action;
                element.textContent = text; element.disabled = disabled; element.setAttribute('aria-label', `${text}：${fact.title}`);
                element.addEventListener('click', callback); parent.append(element); return element;
            };
            const card = (fact, parent) => {
                const article = document.createElement('article'); article.className = 'memory-fact-card';
                const title = document.createElement('h4'); title.textContent = fact.title;
                const source = document.createElement('small'); source.textContent = copyText('memorytimeline.refresh.4', this.records.find(record => record.id === fact.record)?.title || '');
                const quote = document.createElement('blockquote'); quote.textContent = fact.quote;
                const actions = document.createElement('div'); actions.className = 'memory-fact-actions';
                article.append(title, source, quote);
                if (!evidence.includes(fact.record)) {
                    const warning = document.createElement('p'); warning.className = 'memory-fact-warning';
                    warning.textContent = copyText('memorytimeline.refresh.5'); article.append(warning);
                }
                article.append(actions); parent.append(article); return actions;
            };
            for (let index = 0; index < order.length; index++) {
                const fact = facts.find(fact => fact.id === order[index]); if (!fact) continue;
                const item = document.createElement('li'); item.dataset.timelineEvent = fact.id; list.append(item);
                const actions = card(fact, item);
                const move = delta => {
                    const next = [...order], target = index + delta;
                    if (target < 0 || target >= next.length) return;
                    [next[index], next[target]] = [next[target], next[index]];
                    this.change(next, copyText('memorytimeline.refresh.6', fact.title, target + 1), fact.id, delta < 0 ? 'up' : 'down');
                };
                button(actions, fact, 'up', copyText('memorytimeline.refresh.7'), () => move(-1), index === 0);
                button(actions, fact, 'down', copyText('memorytimeline.refresh.8'), () => move(1), index === order.length - 1);
                button(actions, fact, 'remove', copyText('memorytimeline.refresh.9'), () => this.change(order.filter(id => id !== fact.id), copyText('memorytimeline.refresh.10', fact.title), fact.id, 'add'));
            }
            if (!order.length) { const empty = document.createElement('p'); empty.className = 'memory-timeline-empty'; empty.textContent = copyText('memorytimeline.refresh.11'); this.root.append(empty); }
            const available = facts.filter(fact => evidence.includes(fact.record) && !order.includes(fact.id));
            const pool = document.createElement('div'); pool.className = 'memory-fact-pool'; pool.setAttribute('aria-label', copyText('memorytimeline.refresh.12')); this.root.append(pool);
            for (const fact of available) {
                const actions = card(fact, pool);
                button(actions, fact, 'add', copyText('memorytimeline.refresh.13'), () => this.change([...order, fact.id], copyText('memorytimeline.refresh.14', fact.title), fact.id, 'up'));
            }
            if (!available.length) {
                const note = document.createElement('p'); note.className = 'memory-timeline-help';
                note.textContent = order.length ? copyText('memorytimeline.refresh.15') : copyText('memorytimeline.refresh.16');
                pool.append(note);
            }
        }
    }
    global.Huisha3D.ThreeMemoryTimeline = ThreeMemoryTimeline;
})(window);
