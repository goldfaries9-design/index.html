let section = "";
let goal = "";
let time = 30;
let interval;

function setSection(val){
  section = val;
  show("step-body");
}

function goGoals(){
  show("step-goal");
}

function setGoal(val){
  goal = val;
  document.getElementById("workoutTitle").innerText =
    goal === "fat" ? "تمرين تنشيف"
    : goal === "muscle" ? "تمرين تعضيل"
    : goal === "cardio" ? "تمرين لياقة"
    : "تمرين تمدد";

  show("step-workout");
}

function show(id){
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function startWorkout(){
  time = 30;
  document.getElementById("timer").innerText = time;
  const three = new Audio("assets/audio/three.mp3");
  const finish = new Audio("assets/audio/finish.mp3");

  interval = setInterval(()=>{
    time--;
    document.getElementById("timer").innerText = time;

    if(time === 3) three.play();
    if(time === 0){
      finish.play();
      clearInterval(interval);
    }
  },1000);
}
