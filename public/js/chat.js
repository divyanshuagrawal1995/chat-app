const socket=io()
const $messageForm=document.querySelector('#form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormbutton=$messageForm.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
const $sidebar=document.querySelector('#sidebar')

const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight=$messages.offsetHeight


    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop=$messages.scrollHeight
    }


}
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})


socket.on("roomData",({room,users})=>{
const html=Mustache.render(sidebarTemplate,{
    room,
    users
})
 $sidebar.innerHTML=html
})
socket.on('locationMessage',(url)=>{
    console.log(url)
    const html=Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()

})
$messageForm.addEventListener('submit',(e)=>{

    e.preventDefault()
    $messageFormbutton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormbutton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }

        console.log("A message was delivered !!")
    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by the browser')
    }
   $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(message)=>{
            console.log(message)
        })
        $locationButton.removeAttribute('disabled')
    })
})

socket.emit('join',{
    username,
    room
},(error)=>{

  if(error)
  {
      alert(error)
      location.href="/"
  }
})