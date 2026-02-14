// ===== Scene, Camera, Renderer =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

// ===== Lights =====
const ambient = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.7);
directional.position.set(10,20,10);
scene.add(directional);

// ===== Ground =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100,100),
  new THREE.MeshPhongMaterial({ color: 0x556B2F })
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// ===== Obstacles =====
const obstacles = [];
function addObstacle(x,z,w=2,h=3,d=2,color=0x8B4513){
  const mat = new THREE.MeshPhongMaterial({ color });
  const box = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
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
const player={height:2,speed:0.3,object:new THREE.Object3D()};
player.object.position.set(0,player.height+1,15);
scene.add(player.object);
camera.position.set(0,player.height+1,15);
camera.lookAt(0, player.height, 0);

// ===== PointerLock Controls =====
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

// ===== Start Screen =====
const startScreen = document.getElementById("startScreen");
startScreen.addEventListener("click", () => {
  controls.lock();
  startScreen.style.display = "none";
});

// ===== Device Detection =====
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
if(isMobile){
  document.getElementById("mobileControls").style.display="block";
  setupMobileControls();
}else{
  setupDesktopControls();
}

// ===== Bullets & Weapon =====
const bullets = [];
const bulletGeo = new THREE.SphereGeometry(0.1,8,8);
const bulletMat = new THREE.MeshStandardMaterial({color:0xffff00});
function shoot(){
  const bullet = new THREE.Mesh(bulletGeo,bulletMat);
  bullet.position.copy(camera.position);
  const dir = new THREE.Vector3(0,0,-1);
  dir.applyEuler(camera.rotation);
  bullet.direction = dir;
  bullets.push(bullet);
  scene.add(bullet);
}

// AWM senjata
const awm = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,2), new THREE.MeshStandardMaterial({color:0x333333}));
awm.position.set(0.4,-0.3,-0.8);
camera.add(awm);

// ===== Collision =====
function checkCollision(pos){
  for(let obs of obstacles){
    const dx = Math.abs(pos.x-obs.position.x);
    const dz = Math.abs(pos.z-obs.position.z);
    const distX = obs.geometry.parameters.width/2+0.5;
    const distZ = obs.geometry.parameters.depth/2+0.5;
    if(dx<distX && dz<distZ) return true;
  }
  return false;
}

// ===== Mobile Controls =====
function setupMobileControls(){
  const move = {forward:false,backward:false,left:false,right:false};
  let isZoom=false,isRunning=false,isJumping=false;

  document.getElementById("shootBtn").addEventListener("touchstart", shoot);
  document.getElementById("scopeBtn").addEventListener("touchstart",()=>{isZoom=true;});
  document.getElementById("scopeBtn").addEventListener("touchend",()=>{isZoom=false;});
  document.getElementById("runBtn").addEventListener("touchstart",()=>{isRunning=true;});
  document.getElementById("runBtn").addEventListener("touchend",()=>{isRunning=false;});
  document.getElementById("jumpBtn").addEventListener("touchstart",()=>{if(controls.getObject().position.y<=player.height+0.01) isJumping=true;});

  document.querySelectorAll(".dirBtn").forEach(btn=>{
    btn.addEventListener("touchstart",()=>{move[btn.dataset.dir]=true;});
    btn.addEventListener("touchend",()=>{move[btn.dataset.dir]=false;});
  });

  animateMobile(move,isZoom,isRunning,isJumping);
}

// ===== Desktop Controls =====
function setupDesktopControls(){
  const move = {forward:false,backward:false,left:false,right:false};
  let isZoom=false,isRunning=false,isJumping=false;

  document.addEventListener('keydown',e=>{
    switch(e.code){
      case 'KeyW': move.forward=true; break;
      case 'KeyS': move.backward=true; break;
      case 'KeyA': move.left=true; break;
      case 'KeyD': move.right=true; break;
      case 'ShiftLeft': isRunning=true; break;
    }
  });
  document.addEventListener('keyup',e=>{
    switch(e.code){
      case 'KeyW': move.forward=false; break;
      case 'KeyS': move.backward=false; break;
      case 'KeyA': move.left=false; break;
      case 'KeyD': move.right=false; break;
      case 'ShiftLeft': isRunning=false; break;
    }
  });
  document.body.addEventListener('mousedown', shoot);

  animateDesktop(move,isZoom,isRunning,isJumping);
}

// ===== Animate =====
function animateMobile(move,isZoom,isRunning,isJumping){
  requestAnimationFrame(()=>animateMobile(move,isZoom,isRunning,isJumping));
  updatePlayer(move,isZoom,isRunning,isJumping);
  renderer.render(scene,camera);
}

function animateDesktop(move,isZoom,isRunning,isJumping){
  requestAnimationFrame(()=>animateDesktop(move,isZoom,isRunning,isJumping));
  updatePlayer(move,isZoom,isRunning,isJumping);
  renderer.render(scene,camera);
}

// ===== Update player logic =====
function updatePlayer(move,isZoom,isRunning,isJumping){
  const speed = isRunning?player.speed*2:player.speed;
  const direction = new THREE.Vector3();
  if(move.forward) direction.z-=speed;
  if(move.backward) direction.z+=speed;
  if(move.left) direction.x-=speed;
  if(move.right) direction.x+=speed;

  const angle = controls.getObject().rotation.y;
  const newX = controls.getObject().position.x + direction.x*Math.cos(angle) - direction.z*Math.sin(angle);
  const newZ = controls.getObject().position.z + direction.x*Math.sin(angle) + direction.z*Math.cos(angle);
  if(!checkCollision({x:newX,z:newZ})){
    controls.getObject().position.x=newX;
    controls.getObject().position.z=newZ;
  }

  camera.fov = isZoom?30:75;
  camera.updateProjectionMatrix();

  if(isJumping){ controls.getObject().position.y+=0.15; isJumping=false; }
  else if(controls.getObject().position.y>player.height) controls.getObject().position.y-=0.1;
  else controls.getObject().position.y=player.height;

  bullets.forEach((b,i)=>{ b.position.add(b.direction.clone().multiplyScalar(2));
    if(Math.abs(b.position.x)>50||Math.abs(b.position.z)>50){ scene.remove(b); bullets.splice(i,1); }
  });
}

// ===== Resize =====
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
