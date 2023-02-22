// import * as THREE from "./three.min.js";
// import fbxLoader from "";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FBXLoader } from "./FBXLoader";
import * as THREE from "three";
import { Vector2, Vector3 } from "three";
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
  points,
  mouseposition,
  destPosition,
  pointsNew,
  that;

let pointsGroup = [],
  PointTimerList = [];
function Runner(elem) {
  //初始化变量
  this.init(elem);
  window.addEventListener("resize", this.onResize, false);
}
Runner.prototype = {
  init(elem) {
    that = this;
    modeSrc = ["./obj/man.FBX", "./obj/cap.FBX", "./obj/Siren.fbx"];
    particalNum = 51258; //一共有多少个点;
    particalCompleteStep = 0; //第n个点已经运动结束，只有所有粒子都跑到对应的位置，才开始加载另一个模型;

    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xEEEEEE);
    scene.fog = new THREE.FogExp2(0x05050c, 0.0005);

    camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      10,
      10000
    );

    scene.add(new THREE.AmbientLight(0x404040));
    camera.position.x = 0;
    camera.position.y = -600;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);
    camera.position.z = 170;
    camera.position.x = -100;

    renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0x000000);
    renderer.setClearColor(scene.fog.color);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render(scene, camera);
    positions = new Float32Array(particalNum * 3);
    scales = new Float32Array(particalNum);

    for (var i = 0; i < particalNum * 3; i++) {
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
    let textureLoader = new THREE.TextureLoader();
    let smallDot = textureLoader.load("./obj/dot.png");
    const material = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      map: smallDot,
      fog: true,
    });

    points = new THREE.Points(geometry, material);
    // console.log(points);
    new TWEEN.Tween(points.rotation)
      .to(
        {
          z: Math.PI * 15, //开场粒子运动速度
        },
        2000000
      )
      .repeat(Infinity)
      .start();
    scene.add(points);

    this.loadMode(0);

    document.getElementById(elem).appendChild(renderer.domElement);

    this.Bloom();
    this.aniRender();
  },

  loadMode(index) {
    this.loadObj(modeSrc[index], function() {
      if (index + 1 < modeSrc.length) {
        that.loadMode(index + 1);
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
    // scene.rotation.z -= 0.0024;
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
        destPosition = object.children[0].geometry.getAttribute("position");

        for (let i = 0; i < startPositions.count; i++) {
          tween = new TWEEN.Tween(positions);

          const cur = i % destPosition.count;

          tween.to(
            {
              [i * 3]: destPosition.array[cur * 3] * 200,
              [i * 3 + 1]: destPosition.array[cur * 3 + 1] * 200,
              [i * 3 + 2]: destPosition.array[cur * 3 + 2] * 200,
            },
            2000 * Math.random() //模型恢复时间
          );
          tween.easing(TWEEN.Easing.Exponential.InOut);
          tween.delay(2000); //开场粒子时间
          //   tween.delay(800 * Math.random());

          tween.onUpdate(() => {
            startPositions.needsUpdate = true;
          });
          tween.onComplete(() => {
            // window.addEventListener("mousemove", that.onDocumentMouseMove , false);
            particalCompleteStep++;
            if (particalCompleteStep == particalNum) {
              window.addEventListener(
                "mousemove",
                that.onDocumentMouseMove,
                false
              );
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
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      }
    );
  },
  onDocumentMouseMove(event) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    function getIntersects(objects) {
      //将html坐标系转化为webgl坐标系，并确定鼠标点击位置
      mouse.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2) + 1
      );
      //从相机发射一条射线，经过鼠标点击位置
      // console.log(mouse);
      raycaster.setFromCamera(mouse, camera);
      //camera 到 mouse 之间穿过的物体
      //确定所点击位置上的物体数量
      return raycaster.intersectObjects(objects);
    }
    var intersects = getIntersects(scene.children);

    if (intersects.length > 0) {
      let positionsNew = new Float32Array(intersects.length * 3);
      // console.log(intersects.length,positionsNew);
      let scalesNew = new Float32Array(intersects.length);
      for (let j = 0; j < intersects.length/3; j++) {
        //弄一堆坐标在-400~400之间的随时数字;
        let x = intersects[j].point.x;
        let y = intersects[j].point.y;
        let z = intersects[j].point.z;
        positionsNew[j * 3 - 3] = x;
        positionsNew[j * 3 - 2] = y;
        positionsNew[j * 3 - 1] = z;

        let size = THREE.MathUtils.randFloatSpread(12);
        scalesNew[j * 3] = size;
      }

      let geometryNew = new THREE.BufferGeometry();
      geometryNew.setAttribute(
        "position",
        new THREE.BufferAttribute(positionsNew, 3)
      );
      geometryNew.setAttribute(
        "scale",
        new THREE.BufferAttribute(scalesNew, 1)
      );
      let textureLoader = new THREE.TextureLoader();
      let smallDot = textureLoader.load("./obj/dot.png");
      let color = '#' + parseInt(Math.random() * 0x1000000).toString(16).padStart(6, '0') //颜色随机
      let newPointSize = Math.floor(Math.random()*(5-1+1))+1 //1-5随机数
      const materialNew = new THREE.PointsMaterial({
        size: newPointSize,
        sizeAttenuation: true,
        color: color,
        transparent: false,
        opacity: 1,
        map: smallDot,
        fog: true,
      });

      pointsNew = new THREE.Points(geometryNew, materialNew);
      scene.add(pointsNew);
      pointsGroup.push(pointsNew);

      for (let i = 0; i < intersects.length/3; ++i) {
        // intersects[ i ].object.material.color.set( 0xff0000 );

        const startPositionsNew = geometryNew.getAttribute("position");

        let dir = new THREE.Vector3(
          Math.random(),
          Math.random(),
          Math.random()
        ).normalize();

        // console.log((positionsNew[i*3]+dir.x*100)*((Math.random()>0.5)?-1:1)+positionsNew[i*3]);
        new TWEEN.Tween(positionsNew)
          .to(
            {
              [i * 3]:positionsNew[i * 3] *dir.x *0.5 *(Math.random() > 0.5 ? -1 : 1)+positionsNew[i * 3 + 1] ,
              // [i*3]:Math.random()*(100-(-100)+1)-100+positionsNew[i * 3],
              [i * 3 + 1]:positionsNew[i * 3 + 1] *dir.y *0.2 *(Math.random() > 0.5 ? -1 : 1)+positionsNew[i * 3 + 1] ,
              // [i * 3 + 2]:positionsNew[i * 3 + 2] *dir.z *0.2 * (Math.random() > 0.5 ? -1 : 1) ,
              [i * 3 + 2]:positionsNew[i * 3 + 2]
              // z: Math.PI * Math.random()
            },
            3000 * Math.random()
          )
          .onUpdate(() => {

            startPositionsNew.needsUpdate = true;
          })
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start();
        new TWEEN.Tween(pointsNew.material)
          .to({ opacity: 0 },1000 * Math.random())
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      }

      let PointTimer = setTimeout(() => {
        that.clearPoint(); //销毁新建的Points
      }, 2000);
      PointTimerList.push(PointTimer);
    }

    event.preventDefault();
  },
  clearPoint() {
    scene.remove(pointsGroup[0]);
    clearTimeout(PointTimerList[0]);
    pointsGroup.splice(0, 1);
    PointTimerList.splice(0, 1);
  },

  Bloom() {
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.8;
    bloomPass.radius = 0.1;
    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
  },
};

export default Runner;
