const todoInput = document.getElementById('todoIp');
const submitButton = document.getElementById('btnId');
const prioritySelect = document.getElementById('selectId');
const todoList = document.getElementById('todo-items')


// submitButton.addEventListener( 'click' , function() {

//     const task = todoInput.value;
//     // todoInput.value = '';
//     const priority = prioritySelect.value;

//     if( !task || !priority )
//     {
//         alert('Enter the Task and choose the priority !')
//     }

//     let id = Math.floor(Math.random() * 10000000000000001)

    // const data = {
    //     id,
    //     task,
    //     priority
    // }

//     fetch('/todo', {

//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     }).then(function(response) {

//         console.log(response)
//         if( response.status = 200 )
//         {
//             showInUI(data);
//         }
//         else if( response.status === 401 )
//         {
//             alert('please log in first : todo');
//         }
//         else{
//             alert('err at todo')
//         }
//     } );
    
// })

function showInUI(todo)
{

    const image = document.createElement('img');
    image.setAttribute('src',todo.filename );
    image.setAttribute('alt', "Small Image" );
    image.setAttribute('width', "50" );
    image.setAttribute('height', "50" );
    image.setAttribute('style', "max-width: 100%; max-height: 100%; object-fit: cover; margin-left: auto; margin-right: 10px" );


    const element = document.createElement('li');
    element.style.display = 'flex'
    element.innerText = todo.task;
    element.className = 'todo-item'
    todoList.appendChild(element);

    const dive = document.createElement('div');
    dive.setAttribute('margin-left', "auto" );
    dive.className = 'icons'
    element.append(image);
    element.append(dive);
    


    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    const tickButton = document.createElement('button');
    editButton.className = 'icon-button edit-btn';
    deleteButton.className = 'icon-button remove-btn';
    tickButton.className = 'icon-button tick-btn';
    dive.appendChild(editButton);
    dive.appendChild(deleteButton);
    dive.appendChild(tickButton);


    

    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit';
    editButton.appendChild(editIcon);

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-times';
    deleteButton.appendChild(deleteIcon);

    const tickIcon = document.createElement('i');
    tickIcon.className = 'fas fa-check';
    tickButton.appendChild(tickIcon);

    if( todo.saved === 'yes' )
    {
        const listItem = tickButton.closest(".todo-item");

        // Toggle the completed class
        listItem.classList.add("completed");
    }

    editButton.addEventListener('click', function(){
        // console.log(todo.id);
        const data = prompt("What's your task?" );

        if( data ){

            const task = {
                id: todo._id.toString(),
                data: data
            }

            fetch( '/editdata', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(task)
            }).then(function(response) {
                  if( response.status === 200 )
                  {
                    window.location.reload()
                  }
                  else if( response.status === 401 ){
                    alert('log in first');
                }
                  else{
                    alert('Something went wrong in updating the task')
                  }
            } )
        }
    })

    deleteButton.addEventListener( 'click', function() {
        
        const obj ={
            id: todo._id.toString()
        }

        fetch( '/deletetodo', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(obj)
        }).then( function(response){
            if( response.status === 200 )
            {
                window.location.reload()
            }
            else if( response.status === 401 ){
                alert('log in first');
            }
            else{
                alert('Something wrong in todo')
            }
        });

    })

    tickButton.addEventListener( 'click', function(){

                    // Get the parent list item
                    const listItem = tickButton.closest(".todo-item");

                    // Toggle the completed class
                    listItem.classList.add("completed");

                    let idObj = {
                        id: todo._id.toString()
                    }

                    fetch( '/taskDone', {
                        method: 'POST',
                        headers: { 'Content-Type':'application/json'},
                        body: JSON.stringify(idObj)
                    } ).then( function(response){} );
    })
}

console.log('i am todoScript ')


function fetchData()
{
    fetch('/tododata')
.then( function(res){
    if( res.status === 200 )
    {
        return res.json();
    }
    else if( res.status === 401 )
    {
        alert('Log In first ');
    }
    else{
        alert("something went wrong");
    }
})
.then( function(todos ){

    todos.forEach( function(todo ) {

        showInUI(todo);
    });
});
}

fetchData();