const APP_ID = "88a36e1ac69241a6913671943cf1bce4"
const TOKEN = "007eJxTYDhwOl/oQESzTFnCpJjebSeulZ/1yLkfJbW+eva0n0LeCz8rMFhYJBqbpRomJptZGpkYJppZGhqbmRtamhgnpxkmJaea7N7Yl9YQyMhgFbOPlZGBkYEFiEF8JjDJDCZZwCQ7Q3JGYl5eag4DAwBx9CRg"
const CANAL = "canal"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let pistesLocales = []
let utilisateurs = {}

let rejoindreEtAfficherFluxLocal = async () => {

    client.on('user-published', gererUtilisateurRejoint)
    
    client.on('user-left', gererUtilisateurParti)
    
    let UID = await client.join(APP_ID, CANAL, TOKEN, null)

    pistesLocales = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    pistesLocales[1].play(`user-${UID}`)
    
    await client.publish([pistesLocales[0], pistesLocales[1]])
}

let rejoindreFlux = async () => {
    await rejoindreEtAfficherFluxLocal()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let gererUtilisateurRejoint = async (utilisateur, typeMedia) => {
    utilisateurs[utilisateur.uid] = utilisateur 
    await client.subscribe(utilisateur, typeMedia)

    if (typeMedia === 'video'){
        let player = document.getElementById(`user-container-${utilisateur.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${utilisateur.uid}">
                        <div class="video-player" id="user-${utilisateur.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        utilisateur.videoTrack.play(`user-${utilisateur.uid}`)
    }

    if (typeMedia === 'audio'){
        utilisateur.audioTrack.play()
    }
}

let gererUtilisateurParti = async (utilisateur) => {
    delete utilisateurs[utilisateur.uid]
    document.getElementById(`user-container-${utilisateur.uid}`).remove()
}

let quitterEtRetirerFluxLocal = async () => {
    for(let i = 0; pistesLocales.length > i; i++){
        pistesLocales[i].stop()
        pistesLocales[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let basculerMicro = async (e) => {
    if (pistesLocales[0].muted){
        await pistesLocales[0].setMuted(false)
        e.target.innerText = 'Micro allumé'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await pistesLocales[0].setMuted(true)
        e.target.innerText = 'Micro éteint'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let basculerCamera = async (e) => {
    if(pistesLocales[1].muted){
        await pistesLocales[1].setMuted(false)
        e.target.innerText = 'Caméra allumée'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await pistesLocales[1].setMuted(true)
        e.target.innerText = 'Caméra éteinte'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('join-btn').addEventListener('click', rejoindreFlux)
document.getElementById('leave-btn').addEventListener('click', quitterEtRetirerFluxLocal)
document.getElementById('mic-btn').addEventListener('click', basculerMicro)
document.getElementById('camera-btn').addEventListener('click', basculerCamera)
