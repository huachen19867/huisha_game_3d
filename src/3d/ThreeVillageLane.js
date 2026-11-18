(function (global) {
    const { THREE, Huisha3D: game } = global;

    function buildCar(h) {
        const body = new THREE.MeshStandardMaterial({ color: 0x566b68, metalness: .48, roughness: .38 });
        const glass = new THREE.MeshStandardMaterial({ color: 0x273d47, metalness: .32, roughness: .16 });
        const rubber = h.materials.cloth, trim = h.materials.stone;
        const car = new THREE.Group();
        car.position.set(-2.15, 0, 29.7);
        h.scene.add(car);
        // Each section gives the underside and roof widths of the same cross-section.
        function shell(name, sections, material) {
            const positions = [], indices = [];
            for (const [z, bottom, top, lowWidth, highWidth] of sections) {
                positions.push(-lowWidth,bottom,z, lowWidth,bottom,z, highWidth,top,z, -highWidth,top,z);
            }
            for (let j = 0; j < sections.length - 1; j++) for (let k = 0; k < 4; k++) {
                const a = j * 4 + k, b = j * 4 + (k + 1) % 4;
                indices.push(a,b,b+4, a,b+4,a+4);
            }
            const last = (sections.length - 1) * 4;
            indices.push(0,2,1,0,3,2,last,last+1,last+2,last,last+2,last+3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setIndex(indices); geometry.computeVertexNormals();
            h.mesh(name, geometry, material, [0,0,0], 'car_envelope', car);
        }
        shell('station-wagon', [[-2.18,.38,.73,.83,.87],[-1.64,.34,.91,.94,.96],[-.82,.32,.99,.95,.96],[1.68,.32,.96,.95,.94],[2.15,.43,.87,.85,.86]], body);
        shell('wagon-windows', [[-.91,.95,.99,.94,.92],[-.27,.95,1.51,.95,.76],[1.44,.93,1.53,.93,.78],[1.95,.9,1,.87,.86]], glass);
        h.box('car-roof',[1.57,.08,1.78],[0,1.54,.6],body,'car_envelope',car);
        for (const side of [-1,1]) {
            h.box('car-rub-strip',[.04,.06,3.65],[side*.958,.61,.08],rubber,'car_envelope',car);
            h.box('side-mirror',[.24,.12,.21],[side*1.025,1.04,-.62],body,'car_envelope',car);
            h.box('roof-rail',[.045,.055,1.52],[side*.69,1.61,.58],trim,'car_envelope',car);
            for (const z of [-1.29,1.3]) {
                const wheel = h.cylinder('road-tire',.36,.36,.19,[side*.91,.36,z],rubber,'car_envelope',car);
                wheel.rotation.z = Math.PI/2;
                h.mesh('rim-edge',new THREE.TorusGeometry(.2,.019,6,24),trim,[side*1.024,.36,z],'car_envelope',car).rotation.y=Math.PI/2;
                h.cylinder('wheel-hub',.19,.19,.018,[side*1.01,.36,z],trim,'car_envelope',car).rotation.z = Math.PI/2;
            }
            h.box('car-window-divider',[.07,.55,.09],[side*.85,1.23,.66],body,'car_envelope',car).rotation.z=side*.3;
            h.box('car-handle',[.03,.045,.18],[side*.96,.86,.43],trim,'car_envelope',car);
            h.box('headlight',[.48,.15,.05],[side*.57,.67,-2.17],new THREE.MeshBasicMaterial({color:0xffe6a6}),'car_envelope',car);
            h.box('rear-light',[.31,.18,.05],[side*.67,.71,2.14],new THREE.MeshBasicMaterial({color:0xb54032}),'car_envelope',car);
        }
        h.box('rear-bumper',[1.75,.11,.12],[0,.44,2.14],rubber,'car_envelope',car);
        h.box('front-bumper',[1.76,.12,.11],[0,.45,-2.16],rubber,'car_envelope',car);
        h.label('car-address','李 明 收',[.42,.22],[.98,1.07,.1],[0,Math.PI/2,0],'car_envelope',car);
    }

    game.buildVillageLane = function (h) {
        const m = h.materials;
        const wetPaving = m.paving.clone(); wetPaving.color.setHex(0x878f90); wetPaving.roughness = .46;
        h.box('lane-paving',[7.4,.15,29],[0,-.08,19.55],wetPaving);
        const drops = [];
        for (let i=0; i<370; i++) {
            const x = Math.sin(i*71.37)*3.58, z = 5.3+(i*7.713)%28.5, y = (i*.697)%5;
            drops.push(x,y,z,x+.018,y-.11,z);
        }
        const rainGeometry = new THREE.BufferGeometry();
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(drops,3));
        h.laneRain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({color:0xadbdc7,transparent:true,opacity:.23,depthWrite:false}));
        h.scene.add(h.laneRain);
        h.box('porch-step',[2,.15,1.1],[0,-.07,4.65],m.stone);
        for (const side of [-1,1]) {
            h.box('front-plaster',[4,3.4,.22],[side*3,1.6,4.43],m.plaster);
            h.box('front-stoop-wing',[2.65,.68,.75],[side*2.325,.31,4.75],m.wellStone || m.stone);
            h.box('lane-wall',[.22,1.12,29],[side*3.72,.54,19.55],m.plaster);
            h.box('lane-wall-cap',[.36,.1,29],[side*3.72,1.13,19.55],m.darkWood);
            for (let i=0; i<4; i++) {
                const z = 8+i*6.5+side*.7, x = side*(6.1+i%2);
                h.box('village-house',[3.8,2.9,4.3],[x,1.38,z],m.plaster);
                for (const slope of [-1,1]) h.box('village-roof',[2.5,.16,4.85],[x+slope*1.1,3.18,z],m.darkWood).rotation.z=-slope*.3;
                h.box('closed-shutter',[.06,.83,.77],[x-side*1.91,1.72,z],m.wood);
            }
        }
        h.box('front-lintel',[2,.52,.28],[0,3.08,4.45],m.darkWood);
        h.frontDoor = h.box('village-front-door',[2,2.84,.2],[0,1.42,4.42],m.darkWood,'front_gate');
        h.label('old-number','槐树巷\n十四号',[.57,.45],[1.41,1.78,4.56],[0,0,0],'front_gate',undefined,'#304745','#e2e2bc');
        h.box('front-handle',[.08,.23,.06],[.45,-.15,.12],m.brass,'front_gate',h.frontDoor);
        h.box('landslide-barrier',[7.3,.82,.24],[0,.4,34.14],m.stone);
        h.label('landslide-sign','前方塌方　封路',[2,.4],[0,.58,34],[0,Math.PI,0],undefined,undefined,'#593c31','#ffdfa5');
        h.box('fallen-beam',[4.5,.29,.26],[-1.35,.145,16.13],m.wood);
        h.box('duty-counter',[1,1.02,2.4],[3.1,.51,21],m.wood,'duty_book');
        h.box('duty-canopy',[2.4,.15,3.4],[3.52,2.7,21],m.darkWood);
        h.label('duty-sign','村口值班室',[1.64,.42],[3.49,2.16,21],[0,-Math.PI/2,0],'duty_book');
        h.label('open-ledger','旧牌　新牌\n换牌登记',[.69,.46],[2.99,1.035,21.1],[-Math.PI/2,0,Math.PI/2],'duty_book');
        h.box('key-board',[.27,1.22,1.32],[-3.49,1.38,11.5],m.darkWood,'key_board');
        h.label('key-sign','钥 匙 寄 存',[1.18,.24],[-3.33,1.81,11.5],[0,Math.PI/2,0],'key_board');
        for (let i=0;i<3;i++) {
            const z=11.12+i*.37;
            h.mesh('key-ring',new THREE.TorusGeometry(.055,.011,8,16),m.brass,[-3.31,1.47,z],'key_board').rotation.y=Math.PI/2;
            h.box('key-shaft',[.025,.14,.025],[-3.31,1.36,z],m.brass,'key_board');
        }
        for (const [x,z] of [[2.94,21],[-3.26,11.5],[1.2,4.85]]) {
            const light = new THREE.PointLight(0xffca83,5,7,1.65);
            light.position.set(x,2.22,z); h.scene.add(light);
            h.box('porch-lamp',[.18,.22,.2],[x,2.36,z],new THREE.MeshBasicMaterial({color:0xffda9a}));
        }
        buildCar(h);
    };
})(window);
