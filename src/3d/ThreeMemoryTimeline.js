(function (global) {
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
            this.root.replaceChildren(); const known = this.story.state.records, evidence = this.getEvidence();
            const facts = this.definition.facts.filter(fact => known.includes(fact.record));
            const order = this.story.state.drafts[this.id]?.timeline || [];
            const heading = document.createElement('h3'); heading.textContent = '把时间放回原处'; heading.tabIndex = -1;
            const help = document.createElement('p'); help.className = 'memory-timeline-help';
            help.textContent = '从当前两份原文中取出片段，按从早到晚排列。没有明确日期的描述可以留在旁边。换原文时会保留现有时间线草稿。';
            const list = document.createElement('ol'); list.className = 'memory-timeline'; list.setAttribute('aria-label', '你排列的时间线');
            this.root.append(heading, help, list);
            const button = (parent, fact, action, text, callback, disabled = false) => {
                const element = document.createElement('button'); element.type = 'button'; element.dataset.fact = fact.id; element.dataset.action = action;
                element.textContent = text; element.disabled = disabled; element.setAttribute('aria-label', `${text}：${fact.title}`);
                element.addEventListener('click', callback); parent.append(element); return element;
            };
            const card = (fact, parent) => {
                const article = document.createElement('article'); article.className = 'memory-fact-card';
                const title = document.createElement('h4'); title.textContent = fact.title;
                const source = document.createElement('small'); source.textContent = `来自：${this.records.find(record => record.id === fact.record)?.title || ''}`;
                const quote = document.createElement('blockquote'); quote.textContent = fact.quote;
                const actions = document.createElement('div'); actions.className = 'memory-fact-actions';
                article.append(title, source, quote);
                if (!evidence.includes(fact.record)) {
                    const warning = document.createElement('p'); warning.className = 'memory-fact-warning';
                    warning.textContent = '这个片段的来源不在当前两份选证里。'; article.append(warning);
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
                    this.change(next, `已把「${fact.title}」移到第 ${target + 1} 位。还要主动提交推理。`, fact.id, delta < 0 ? 'up' : 'down');
                };
                button(actions, fact, 'up', '上移', () => move(-1), index === 0);
                button(actions, fact, 'down', '下移', () => move(1), index === order.length - 1);
                button(actions, fact, 'remove', '放回旁边', () => this.change(order.filter(id => id !== fact.id), `已把「${fact.title}」放回旁边。`, fact.id, 'add'));
            }
            if (!order.length) { const empty = document.createElement('p'); empty.className = 'memory-timeline-empty'; empty.textContent = '时间线还是空的，先从下面的原文片段中挑选。'; this.root.append(empty); }
            const available = facts.filter(fact => evidence.includes(fact.record) && !order.includes(fact.id));
            const pool = document.createElement('div'); pool.className = 'memory-fact-pool'; pool.setAttribute('aria-label', '当前原文里未放入的片段'); this.root.append(pool);
            for (const fact of available) {
                const actions = card(fact, pool);
                button(actions, fact, 'add', '放入时间线', () => this.change([...order, fact.id], `已把「${fact.title}」放到时间线末尾。`, fact.id, 'up'));
            }
            if (!available.length) {
                const note = document.createElement('p'); note.className = 'memory-timeline-help';
                note.textContent = order.length ? '当前原文的片段已放入，或还需要换一份原文。可以调整顺序，再提交解释。' : '先在上方选择已读原文，能核对的片段才会出现在这里。';
                pool.append(note);
            }
        }
    }
    global.Huisha3D.ThreeMemoryTimeline = ThreeMemoryTimeline;
})(window);
