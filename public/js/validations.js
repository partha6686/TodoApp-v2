let passErrMsg = document.querySelector(".pass-valdate");
let pass = document.querySelector("#password");
let confirmPass = document.querySelector("#confirm-password");
let submitBtn = document.querySelector(".submit-btn");

passErrMsg.hidden=true;

confirmPass.addEventListener("keyup", validate);
submitBtn.addEventListener("click", submitForm);

function validate(){
    if(pass.value !== confirmPass.value){
        passErrMsg.hidden=false;
        return false;
    }else{
        passErrMsg.hidden=true;
        return true;
    }
};
function submitForm(e){
    if(validate() !== true){
        e.preventDefault();
    }
}

