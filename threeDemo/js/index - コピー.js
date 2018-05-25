class Dust {
  constructor() {
    var mesh,
      geometry,
      material,
      p,
      particle,
      vert,
      speed,
      _x,
      _y,
      _z;

    this.delta = 0;

    geometry = new THREE.Geometry();
    material = new THREE.ParticleBasicMaterial({
      color: 0xFFFFFF,
      size: 20,
      
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.4
    });

    for (p = 0; p < 50; p += 1) {
      _x = Math.random() * 800 - 400;
      _y = -500 + Math.random() * 500 - 250;
      _z = -100 + Math.random() * 200;

      vert = new THREE.Vector3(_x, _y, _z);
      speed = 0.3 + Math.random() * 0.7;
      vert.speed = speed;
      vert.baseX = _x;

      geometry.vertices.push(vert);
    }

    mesh = new THREE.ParticleSystem(geometry, material);
    mesh.sortParticles = true;

    this.mesh = mesh;
  }

  update() {
    var p,
      vert;
    this.delta += 1;
    for (p = 0; p < this.mesh.geometry.vertices.length; p += 1) {
      vert = this.mesh.geometry.vertices[p];
      vert.y += vert.speed;
      vert.x = vert.baseX + Math.sin((this.delta * vert.speed) / 100) * 2;

      if (vert.y > 0) {
        vert.y -= 900;
      }
    }
  }
}

class Beam {
  constructor(b) {
    var geometry,
      material,
      object,
      wMaterial,
      wGeometry,
      edges,
      scale,
      multiplier,
      radius = 500,
      lineColor,
      squareColor,
      i,
      x,
      y,
      z;

    var colors = [{
        lineColor: 0x00d8ff,
        squareColor: 0xccccff
      }, // blue
      {
        lineColor: 0xcc66ff,
        squareColor: 0xcc99ff
      }
    ];

    this.blue = b;
    this.alternateColor = false;

    if (this.blue) {
      lineColor = colors[0].lineColor;
      squareColor = colors[0].squareColor;
    } else {
      lineColor = colors[1].lineColor;
      squareColor = colors[1].squareColor;
    }

    this.mesh = new THREE.Object3D();

    //lines
    wMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: Math.random() * 4 + 2,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.4
    });

    wGeometry = new THREE.BoxGeometry(40, 40, 3000);

    edges = new THREE.Line(wGeometry, wMaterial, THREE.LinePieces);
    edges.rotation.x = Math.PI / 2;
    this.mesh.add(edges);
    this.edges = edges;

    //square
    material = new THREE.MeshBasicMaterial({
      color: squareColor,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9
    });

    geometry = new THREE.PlaneGeometry(40, 40);

    object = new THREE.Mesh(geometry, material);
    // object.rotation.x = Math.PI/2;
    object.position.x = 1500;
    this.mesh.add(object);
    this.square = object;

    //positioning
    scale = 0.2 + Math.random() * 0.5;
    z = -(radius / 2) + Math.random() * radius;
    y = -(radius / 2) + Math.random() * radius;
    x = Math.random() * 3500;

    this.mesh.position.set(x, y, z);
    this.mesh.scale.set(scale, scale, scale);
  }

  update(hide, alternate) {
    var x = this.mesh.parent.position.x + this.mesh.position.x,
      opacity;

    if (x > 1500) {
      this.mesh.position.x -= 3500;
    }

    opacity = (this.alternateColor && this.blue || !this.alternateColor && !this.blue) ? 0.2 : 1;

    this.square.material.opacity = hide ? 0 : 0.9 * opacity;
    this.edges.material.opacity = hide ? 0 : 0.4 * opacity;
  }

}

class Beams {
  constructor() {
    var count = 400,
      object,
      i,
      b;

    this.shapes = [];
    this.mesh = new THREE.Object3D();
    this.mesh.position.set(0, 0, -500);

    for (i = 0; i < count; i += 1) {
      if (i % 2 === 0) {
        b = true;
      } else {
        b = false;
      }

      object = new Beam(b);
      this.mesh.add(object.mesh);
      this.shapes.push(object);
    }
  }

  update(d, currentText) {
    var i,
      hide,
      alternateColor,
      threshold;

    this.mesh.position.x += 10;
    threshold = Math.ceil((Math.sin(d * 2 - Math.PI / 2) * 0.51 + 0.5) * this.shapes.length);

    for (i = 0; i < this.shapes.length; i += 1) {
      this.shapes[i].update(i >= threshold, currentText);
    }
  }
}

class Text {
  constructor(d) {
    var attributes,
      uniforms,
      material,
      geometry,
      mesh,
      i;

    this.animating = false;
    this.w = 1000;
    this.h = 600;
    this.delta = d || 0;
    this.text1 = "LOVE";
    this.text2 = "HATE";
    this.currentText = 0;
    this.textArray = [this.text1, this.text2];
    this.textAttributes = [];

    this.createScene();
    this.createMask();
    this.drawMask(this.delta);
    this.updateMask();

    attributes = {};

    uniforms = {
      map: {
        type: "t",
        value: this.texture
      },
      mask: {
        type: "t",
        value: this.mask
      }
    };

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      attributes: attributes,
      vertexShader: document.getElementById('vertShader').innerText,
      fragmentShader: document.getElementById('fragShader').innerText,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    geometry = new THREE.PlaneGeometry(10, 5, 1, 1);

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -10;
    this.mesh = mesh;
  }

  createScene() {
    var canvas,
      w = this.w,
      h = this.h,
      i;

    canvas = document.createElement('canvas');
    //document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(100, w / h, 1, 10000);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas
    });

    this.renderer.setSize(w, h);

    this.beams = new Beams();
    this.scene.add(this.beams.mesh);

    this.texture = new THREE.Texture(canvas);

    for (i = 0; i < this.textArray[0].length; i += 1) {
      this.textAttributes.push({
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 + 0.2,
        scale: Math.random() * 360,
        scaleSpeed: Math.random() * 2 + 0.2,
        x: Math.random() * 360,
        xSpeed: Math.random() * 3 + 0.5,
        y: Math.random() * 360,
        ySpeed: Math.random() * 3 + 0.5
      });
    }
  }

  createMask() {
    var canvas;

    canvas = document.createElement('canvas');
    canvas.width = this.w;
    canvas.height = this.h;
    //document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    this.ctx = canvas.getContext('2d');
    this.ctx.fillStyle = 'red';
    this.ctx.font = "800 140px Proxima Nova, proxima-nova, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.mask = new THREE.Texture(canvas);
  }

  drawMask() {
    var i, x, y, att, letter, len, scale,
      SPACER = 110,
      R_RANGE = Math.PI / 8,
      X_RANGE = 8,
      Y_RANGE = 20,
      S_RANGE = 0.2,
      MULTIPLIER = 1.5,
      DEG2RAD = Math.PI / 180;

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.currentText = Math.sin(this.delta) > 0 ? 0 : 1;

    len = this.textArray[this.currentText].length;

    for (i = 0; i < len; i += 1) {
      letter = this.textArray[this.currentText][i];
      att = this.textAttributes[i];
      x = -(SPACER * len) / 2.5 + i * SPACER + Math.sin(att.x * DEG2RAD) * X_RANGE;
      y = Math.sin(att.y * DEG2RAD) * Y_RANGE;
      scale = 1 + Math.sin(att.scale * DEG2RAD) * S_RANGE;
      this.ctx.save();
      this.ctx.translate(this.w / 2 + x * MULTIPLIER, this.h / 2 + y * MULTIPLIER);
      this.ctx.scale(scale * MULTIPLIER, scale * MULTIPLIER);
      this.ctx.rotate(Math.sin(att.rotation * DEG2RAD) * R_RANGE);
      this.ctx.fillText(letter, 0, 0);
      this.ctx.restore();
    }
  }

  updateMask() {
    var i,
      att;

    for (i = 0; i < this.textAttributes.length; i += 1) {
      att = this.textAttributes[i];
      att.rotation += att.rotationSpeed;
      att.scale += att.scaleSpeed;
      att.x += att.xSpeed;
      att.y += att.ySpeed;
    }

    this.drawMask(this.delta);
    this.mask.needsUpdate = true;
  }

  update() {
    this.delta += 0.015;

    this.beams.update(this.delta, this.currentText);
    this.texture.needsUpdate = true;

    this.updateMask();

    this.renderer.render(this.scene, this.camera);
  }
}

class World {

  constructor() {
    this.delta = 0;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setClearColor(0x000000);
    document.body.appendChild(this.renderer.domElement);
    this.resize();

    this.addCube();
    this.addLight();

    requestAnimationFrame(this.render.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
  }

  update() {
    this.delta += 0.1;

    this._text.update();
    this._dust.update();
  }

  addLight() {
    var ambient;
    ambient = new THREE.AmbientLight(0x777777);
    this.scene.add(ambient);
  }

  addCube() {
    this._text = new Text(1);
    this.scene.add(this._text.mesh);

    this._dust = new Dust();
    this._dust.mesh.position.y = 344;
    this._dust.mesh.position.z = -1000;
    this.scene.add(this._dust.mesh);
  }

  render() {
    this.update();
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

var _w = new World();