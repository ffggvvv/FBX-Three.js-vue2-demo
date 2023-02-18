// import * as THREE from "./three.min.js";
// import fbxLoader from "";
import TWEEN from '@tweenjs/tween.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import  { FBXLoader }  from './FBXLoader';
import *as THREE from 'three';
import { Vector3 } from "three";
// console.log(this,"this");
// console.log(THREE);
let modeSrc,
  particalNum,
  particalCompleteStep,
  tween,
  scene,
  camera,
  renderer,
  positions,
  scales,
  geometry,
  composer,
  points

function Runner(elem) {
  //初始化变量
  this.init(elem);
  window.addEventListener("resize", this.onResize, false);
}
Runner.prototype = {
  init(elem) {
    modeSrc = ["./obj/man.FBX","./obj/cap.FBX"];
    particalNum = 50000; //一共有多少个点;
    particalCompleteStep = 0; //第n个点已经运动结束，只有所有粒子都跑到对应的位置，才开始加载另一个模型;

    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xEEEEEE);
    scene.fog = new THREE.FogExp2(0x0000ff, 0.0008,);
    // console.log(scene);
    camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    scene.add( new THREE.AmbientLight( 0x404040 ) );
    camera.position.x = 0;
    camera.position.y = -900;
    camera.position.z = 0;
    camera.lookAt(0,0,0);
    camera.position.z = 135;
    camera.position.x = -150;



    renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0x000000);
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render(scene, camera);
    positions = new Float32Array(particalNum * 3);
    scales = new Float32Array(particalNum);

    for (var i = 0; i < particalNum*3; i++) {
      //弄一堆坐标在-400~400之间的随时数字;
      var x = THREE.MathUtils.randFloatSpread(1200);
      var y = THREE.MathUtils.randFloatSpread(1200);
      var z = THREE.MathUtils.randFloatSpread(1200);
      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      var size = THREE.MathUtils.randFloatSpread(12);
      scales[i] = size;
    }

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));
    let textureLoader = new THREE.TextureLoader()
    let smallDot = textureLoader.load('./obj/dot.png')
    const material = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        map: smallDot
    });

    points = new THREE.Points(geometry, material);
    // console.log(points);
    // new TWEEN.Tween(points.rotation)
    //         .to(
    //             {
    //                 z: Math.PI * 15, //开场粒子运动速度
    //             },
    //             200000
    //         )
    //         .repeat(Infinity)
    //         .start();
    scene.add(points);

    this.loadMode(0);

    document.getElementById(elem).appendChild(renderer.domElement);

    // console.log(this.loadObj);
    // console.log(this.aniRender);
    this.Bloom();
    this.aniRender();
  },

  loadMode(index) {
    console.log(modeSrc);
    let that = this
    this.loadObj(modeSrc[index], function() {
      if (index + 1 < modeSrc.length) {
        that.loadMode(index + 1)
      } else {
        that.loadMode(0);
      }
    });
  },

  aniRender() {

    requestAnimationFrame(() => {
      this.aniRender();
    });
    TWEEN.update();
    

     scene.rotation.z -= 0.0024;
    // renderer.render(scene, camera);
    composer.render();
  },

  onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },

  loadObj(objSrc, fn) {
    particalCompleteStep = 0;
    const loader = new FBXLoader();
    loader.load(
      objSrc,
      function(object) {
        const startPositions = geometry.getAttribute("position");
        const destPosition = object.children[0].geometry.getAttribute(
          "position"
        );
        // console.log(destPosition.count,"sssss");
            //console.log(startPositions);
        for (let i = 0; i < startPositions.count; i++) {
          tween = new TWEEN.Tween(positions);
          
          const cur = i % destPosition.count;
        //   console.log(destPosition.array[cur * 3] * 130)
          tween.to(
            {
              [i * 3]: destPosition.array[cur * 3] * 200,
              [i * 3 + 1]: destPosition.array[cur * 3 + 1] * 200,
              [i * 3 + 2]: destPosition.array[cur * 3 + 2] * 200,
              
            },
            2000 * Math.random() //模型恢复时间
          );
        //   console.log(i * 3);
          tween.easing(TWEEN.Easing.Exponential.InOut);
          tween.delay(2000); //开场粒子时间
        //   tween.delay(800 * Math.random());
          tween.onUpdate(() => {
            startPositions.needsUpdate = true;
          });
          tween.onComplete(() => {
            particalCompleteStep++;
            if (particalCompleteStep == particalNum) {
              //所有的粒子运行都结束了;
              setTimeout(function() {
                fn();
              }, 8000);
            }
          });
          tween.start();
        }
      },
      function(xhr) {
        //你可以在这里弄个加载进度，但是我的模型都只有几十kb，我就偷个懒不弄了;
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        
      }
    );
  },
  Bloom() {
    const renderScene = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.8;
    bloomPass.radius = 0.1;
    composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
  },
};

export default Runner;
