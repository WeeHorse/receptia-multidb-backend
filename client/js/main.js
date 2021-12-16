async function loadComments(){
    let comments = await fetch('/rest/comments')
    comments = await comments.json()
    let $comments = comments.map(comment => `
        <article>            
            <p>${comment.text}</p>
            <p><em>${new Date(comment.created).toLocaleDateString('sv-SE')} ${comment.author}</em></p>
        </article>
    `).join('')
    document.querySelector('#comments').insertAdjacentHTML('beforeend', $comments)
}

loadComments()

async function saveComment(){
    let result = await fetch('/rest/comments', {
        method: 'post'
    })
    return false
}