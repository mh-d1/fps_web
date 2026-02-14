// ===== Scene =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== Lights =====
scene.add(new THREE.AmbientLight(0xffffff,1));
const dirLight = new THREE.DirectionalLight(0xffffff,0.7);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// ===== Ground =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100,100),
  new THREE.MeshPhongMaterial({color:0x556B2F})
);
ground.rotation.x=-Math.PI/2;
scene.add(ground);

// ===== Obstacles =====
const obstacles=[];
function addObstacle(x,z,w=2,h=3,d=2,color=0x8B4513){
  const box = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshPhongMaterial({color}));
  box.position.set(x,h/2,z);
  scene.add(box);
  obstacles.push(box);
}
addObstacle(10,10,3,4,3);
addObstacle(-15,5,3,4,3,0xA0522D);
addObstacle(0,-20,5,5,5,0x654321);
addObstacle(-25,-15,4,3,2);
addObstacle(20,-10,3,3,3,0xA0522D);

// ===== Player =====
const player={x:0,y:2,z:15,speed:0.3};
camera.position.set(player.x,player.y,player.z);

// ===== Movement =====
const move = {forward:false,backward:false,left:false,right:false};
document.getElementById("forwardBtn").addEventListener("mousedown",()=>move.forward=true);
document.getElementById("forwardBtn").addEventListener("mouseup",()=>move.forward=false);
document.getElementById("backwardBtn").addEventListener("mousedown",()=>move.backward=true);
document.getElementById("backwardBtn").addEventListener("mouseup",()=>move.backward=false);
document.getElementById("leftBtn").addEventListener("mousedown",()=>move.left=true);
document.getElementById("leftBtn").addEventListener("mouseup",()=>move.left=false);
document.getElementById("rightBtn").addEventListener("mousedown",()=>move.right=true);
document.getElementById("rightBtn").addEventListener("mouseup",()=>move.right=false);

// ===== Shoot =====
document.getElementById("shootBtn").addEventListener("click",()=>{
  const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), new THREE.MeshStandardMaterial({color:0xffff00}));
  bullet.position.set(camera.position.x,camera.position.y,camera.position.z);
  const dir = new THREE.Vector3(0,0,-1);
  dir.applyEuler(camera.rotation);
  bullet.direction = dir;
  scene.add(bullet);
  bullets.push(bullet);
});

// ===== Bullets =====
const bullets=[];
function updateBullets(){
  bullets.forEach((b,i)=>{
    b.position.add(b.direction.clone().multiplyScalar(0.5));
    if(Math.abs(b.position.x)>50||Math.abs(b.position.z)>50){
      scene.remove(b);
      bullets.splice(i,1);
    }
  });
}

// ===== Animate =====
function animate(){
  requestAnimationFrame(animate);
  
  // Update player
  if(move.forward) camera.position.z-=player.speed;
  if(move.backward) camera.position.z+=player.speed;
  if(move.left) camera.position.x-=player.speed;
  if(move.right) camera.position.x+=player.speed;

  updateBullets();
  renderer.render(scene,camera);
}
animate();

// ===== Resize =====
window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
