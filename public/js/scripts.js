const todoItem = document.querySelectorAll(".todo-list-item");
const todoLabel = document.querySelectorAll(".todo-list-label");
const todoCheckBox = document.querySelectorAll(".checkbox");
const todoCustomCheck = document.querySelectorAll(".checkmark");
const deleteBtn = document.querySelectorAll(".delete-todo-icon");
const todoListForm = document.querySelectorAll(".list-form");
const todoStatusForm = document.querySelectorAll(".status-form");
const clearCompleted = document.querySelector(".clear-completed");
const clearCompletedForm = document.querySelector(".clear-completed-form");

itemCounter();

document.querySelector(".show-all").classList.add("add-link-color");

for(let i=0;i<todoLabel.length;i++){
    // CHECK A TODO AFTER COMPLETION
    todoLabel[i].addEventListener("click",function(e){
        console.log(e.target);
        todoItem[i].classList.toggle("inactiveTodoItem");
        todoLabel[i].classList.toggle("inactiveTodoLabel");
        todoCheckBox[i].toggleAttribute("checked");
        todoCustomCheck[i].classList.toggle("inactiveTodo");
        itemCounter();
        todoStatusForm[i].submit();
        e.preventDefault();
    });
    // DELETE A TODO
    deleteBtn[i].addEventListener("click",function(e){
        todoListForm[i].submit();
        e.preventDefault();
    });
}

// ON CLICKING ALL, ALL THE TODOs ARE SHOWN (BY DEFAULT)
document.querySelector(".show-all").addEventListener("click",function(){
    //let listItem = document.querySelectorAll(".todo-list-item");
    todoItem.forEach(function(item){
       item.style.display="flex";
    });

    document.querySelector(".show-all").classList.add("add-link-color");
    document.querySelector(".show-active").classList.remove("add-link-color");
    document.querySelector(".show-completed").classList.remove("add-link-color");
});


// ON CLICKING ACTIVE, ALL THE ACTIVE TODOs ARE SHOWN
document.querySelector(".show-active").addEventListener("click",function(){
    //let listItem = document.querySelectorAll(".todo-list-item");
    todoItem.forEach(function(item){
        if(!item.classList.contains("inactiveTodoItem")){
            item.style.display="flex";
        }else{
            item.style.display="none";
        }
    });

    document.querySelector(".show-all").classList.remove("add-link-color");
    document.querySelector(".show-active").classList.add("add-link-color");
    document.querySelector(".show-completed").classList.remove("add-link-color");
});

// ON CLICKING COMPLETED, ALL THE COMPLETED TODOs ARE SHOWN
document.querySelector(".show-completed").addEventListener("click",function(){
    //var listItem = document.querySelectorAll(".todo-list-item");
    todoItem.forEach(function(item){
        if(item.classList.contains("inactiveTodoItem")){
            item.style.display="flex";
        }else{
            item.style.display="none";
        }
    });

    document.querySelector(".show-all").classList.remove("add-link-color");
    document.querySelector(".show-active").classList.remove("add-link-color");
    document.querySelector(".show-completed").classList.add("add-link-color");
});

// COUNTS AND PRINTS THE NO OF REMAINING TODOS
function itemCounter(){
    var totalTodo = document.querySelectorAll(".todo-list-label").length;
    var inActiveTodo = document.querySelectorAll(".inactiveTodoLabel").length;
    var activeTodo = totalTodo - inActiveTodo ;
    document.querySelector(".total-active-todo").textContent = activeTodo + " items left";
}

// DELETE ALL COMPLETED TODOs
clearCompleted.addEventListener("click",function(){
    clearCompletedForm.submit();
});


//  SUBMIT THEME FORM  
document.querySelector(".theme-icon").addEventListener("click",function(){
    document.querySelector(".theme-form").submit();
});