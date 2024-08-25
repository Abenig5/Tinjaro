document
  .getElementById("mobile-menu-button")
  .addEventListener("click", function () {
    document.getElementById("mobile-menu").classList.toggle("hidden");
  });

const container = document.getElementById("scene-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

let beans = [];
const loader = new THREE.GLTFLoader();
const beanPositions = [
  { x: 5, y: 0, z: 0 },
  { x: -5, y: 0, z: 0 },
  { x: 0, y: 0, z: 5 },
];

beanPositions.forEach((pos, index) => {
  loader.load(
    "images/scene.gltf",
    function (gltf) {
      gltf.scene.scale.set(0.5, 0.5, 0.5);
      gltf.scene.position.set(pos.x, pos.y, pos.z);
      gltf.scene.visible = true;
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = false;
          child.material.opacity = 1;
        }
      });

      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      const pivot = new THREE.Group();
      pivot.add(gltf.scene);
      scene.add(pivot);
      beans.push(pivot);
    },
    undefined,
    function (error) {
      console.error("Error loading GLTF:", error);
    }
  );
});

const textureLoader = new THREE.TextureLoader();
let coffeeBag;
textureLoader.load("images/bag.png", function (texture) {
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.SpriteMaterial({ map: texture });
  coffeeBag = new THREE.Sprite(material);
  coffeeBag.scale.set(10, 15, 1);
  scene.add(coffeeBag);
});

camera.position.set(0, 0, 20);
camera.lookAt(new THREE.Vector3(0, 0, 0));

function animate() {
  requestAnimationFrame(animate);
  const radius = 5;
  beans.forEach((bean, index) => {
    bean.rotation.y += 0.01;
    bean.position.x =
      radius * Math.cos(bean.rotation.y + index * (Math.PI / 1.5));
    bean.position.z =
      radius * Math.sin(bean.rotation.y + index * (Math.PI / 1.5));
  });

  if (coffeeBag) {
    coffeeBag.position.y = Math.sin(Date.now() * 0.002) * 0.5;
  }

  renderer.render(scene, camera);
}

// Lazy load the scene container
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animate();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(container);

window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
