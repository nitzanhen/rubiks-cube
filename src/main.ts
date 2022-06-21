import * as THREE from 'three';
import { Color, Matrix3, Vector3 } from 'three';
import { makeArray } from 'rhax';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generatePermutations } from './utils';
import './style.css';

const canvas = document.querySelector('canvas')!;

const n = 3;

const positions = [...generatePermutations(
  ...makeArray(3, () => makeArray(n, i => i - (n - 1) / 2))
)];


const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new Color("#222222");

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const cubes: THREE.Mesh[] = [];

for (const pos of positions) {
  const piece = new THREE.BoxGeometry(0.95, 0.95, 0.95).toNonIndexed();

  const material = new THREE.MeshBasicMaterial({
    vertexColors: true
  });

  const colors = [];
  const faceColors = ['blue', 'green', 'yellow', 'orange', 'red', 'white']
  // These are the directions in which three.js paints the faces, in order.
  const directions = [
    new Vector3(1, 0, 0), new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0), new Vector3(0, -1, 0),
    new Vector3(0, 0, 1), new Vector3(0, 0, -1),
  ];

  for (let j = 0; j < 6; j++) {

    const position = new Vector3(pos[0], pos[1], pos[2]);

    const direction = directions[j];
    const facingOutwards = position.clone().add(direction).length() > position.clone().sub(direction).length();

    const color = facingOutwards ? new Color(faceColors[j]) : scene.background.clone();

    for (let k = 0; k < 6; k++) {
      colors.push(color.r, color.g, color.b);
    }
  }

  piece.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const cube = new THREE.Mesh(piece, material);
  cube.position.set(pos[0], pos[1], pos[2]);

  cubes.push(cube);
  scene.add(cube);
}


//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(10, 7, 10);
controls.update();

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  renderer.render(scene, camera);
}
animate();

function rotate(axis: 'x' | 'y' | 'z', sign: 1 | -1, clockwise: boolean) {

  const direction = new Vector3();
  direction[axis] = sign * (n - 1) / 2;

  const faceCubes = cubes.filter(cube => cube.position[axis] === direction[axis]);

  faceCubes.forEach(cube => {
    cube.quaternion.setFromAxisAngle(direction, (clockwise ? -1 : 1) * Math.PI / 2);
    //console.log(cube.position, rotateNinety(cube.position, axis, sign, clockwise));

    const positionRotation = rotateNinety(axis, clockwise, sign);
    console.log(cube.position.clone());
    cube.position.applyMatrix3(positionRotation);
    console.log(cube.position);
  })


}

function rotateNinety(axis: 'x' | 'y' | 'z', clockwise: boolean, sign: 1 | -1): THREE.Matrix3 {
  const s = sign * (clockwise ? -1 : 1);
  switch (axis) {
    case 'x': return new Matrix3().set(
      1, 0, 0,
      0, 0, s*1,
      0, s*-1, 0
    )
    .transpose();
    case 'y': return new Matrix3().set(
      0, 0, s*-1,
      0, 1, 0,
      s*1, 0, 0
    ).transpose();
    case 'z': return new Matrix3().set(
      0, s*1, 0,
      s*-1, 0, 0,
      0, 0, 1
    ).transpose()
  }
}

rotate('z', -1, true);