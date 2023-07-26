const todoInput = document.getElementById('todoIp');
const submitButton = document.getElementById('btnId');
const prioritySelect = document.getElementById('selectId');
const todoList = document.getElementById('todo-items')


submitButton.addEventListener( 'click' , function() {

    const task = todoInput.value;
    todoInput.value = '';
    const priority = prioritySelect.value;

    if( !task || !priority )
    {
        alert('Enter the Task and choose the priority !')
    }

    let id = Math.floor(Math.random() * 10000000000000001)

    const data = {
        id,
        task,
        priority
    }

    fetch('/todo', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function(response) {

        console.log(response)
        if( response.status = 200 )
        {
            showInUI(data);
        }
        else if( response.status === 401 )
        {
            alert('please log in first : todo');
        }
        else{
            alert('err at todo')
        }
    } );
    
})

function showInUI(todo)
{
    const element = document.createElement('li');
    element.innerText = todo.task;
    element.className = 'todo-item'
    todoList.appendChild(element);

    const dive = document.createElement('div');
    dive.className = 'icons'
    element.append(dive);


    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    editButton.className = 'icon-button';
    deleteButton.className = 'icon-button';
    dive.appendChild(editButton);
    dive.appendChild(deleteButton);

    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit';
    editButton.appendChild(editIcon);

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-times';
    deleteButton.appendChild(deleteIcon);


    editButton.addEventListener('click', function(){
        // console.log(todo.id);
        const data = prompt("What's your task?" );

        if( data ){

            const task = {
                id: todo.id,
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
            id: todo.id
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