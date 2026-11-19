(function (global) {
    const copyText=global.HuishaCopy;
    class ThreeSettings {
        constructor({ preferences, onChange }) { Object.assign(this, { preferences, onChange }); }
        append(container) {
            const root = document.createElement('section'); root.className = 'play-settings';
            const controls = [], format = (name, value) => name === 'volume' ? `${Math.round(value * 100)}%` : `${value.toFixed(2)}${name.includes('Sensitivity') ? copyText('settings.append') : ''}`;
            const refresh = () => {
                for (const { input, output, name } of controls) {
                    if (input.type === 'checkbox') input.checked = this.preferences.values[name];
                    else { input.value = this.preferences.values[name]; output.value = format(name, this.preferences.values[name]); }
                }
                sound.textContent = this.preferences.values.muted ? copyText('settings.append.2') : copyText('settings.append.3');
                status.textContent = this.preferences.saveAvailable ? copyText('settings.append.4') : copyText('settings.append.5');
            };
            const changed = () => { this.onChange(); refresh(); };
            for (const [name, text, min, max, step] of [
                ['brightness', copyText('settings.append.6'), 0.8, 1.8, 0.01], ['volume', copyText('settings.append.7'), 0, 1, 0.01],
                ['mouseSensitivity', copyText('settings.append.8'), 0.25, 3, 0.05], ['touchSensitivity', copyText('settings.append.9'), 0.25, 3, 0.05]
            ]) {
                const label = document.createElement('label'); label.className = 'setting-range';
                const title = document.createElement('span'); title.textContent = text;
                const input = document.createElement('input'); input.type = 'range'; input.min = min; input.max = max; input.step = step;
                input.dataset.setting = name; input.setAttribute('aria-label', text);
                const output = document.createElement('output'); output.id = `setting-value-${name}`; input.setAttribute('aria-describedby', output.id);
                input.addEventListener('input', () => { this.preferences.set(name, Number(input.value)); changed(); });
                controls.push({ input, output, name }); label.append(title, input, output); root.append(label);
            }
            for (const [name, text] of [['invertY', copyText('settings.append.10')], ['pointerLock', copyText('settings.append.11')]]) {
                const label = document.createElement('label'); label.className = 'setting-check';
                const input = document.createElement('input'); input.type = 'checkbox'; input.dataset.setting = name;
                input.addEventListener('change', () => { this.preferences.set(name, input.checked); changed(); });
                const title = document.createElement('span'); title.textContent = text;
                controls.push({ input, name }); label.append(input, title); root.append(label);
            }
            const hint = document.createElement('p'); hint.className = 'setting-hint'; hint.textContent = copyText('settings.append.12');
            const actions = document.createElement('div'); actions.className = 'setting-actions';
            const sound = document.createElement('button'); sound.type = 'button'; sound.dataset.setting = 'muted';
            sound.addEventListener('click', () => { this.preferences.set('muted', !this.preferences.values.muted); changed(); });
            const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = copyText('settings.append.13');
            reset.addEventListener('click', () => { this.preferences.reset(); changed(); });
            const status = document.createElement('p'); status.className = 'setting-hint'; status.setAttribute('role', 'status');
            actions.append(sound, reset); root.append(hint, actions, status); container.append(root); refresh();
        }
    }
    global.Huisha3D.ThreeSettings = ThreeSettings;
})(window);
