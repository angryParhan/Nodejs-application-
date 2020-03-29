const $card = document.querySelector('#card')
if ($card) {
  $card.addEventListener('click', e => {
    if (e.target.classList.contains('js-remove')) {
      const id = e.target.dataset.id
      const csrf = e.target.dataset.csrf

      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf
        }
      }).then(res => res.json())
        .then(card => {
          if (card.courses.length) {
            const html = card.courses.map(c => {
              return `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.count}</td>
                  <td>
                    <button 
                      class="btn btn-small waves-effect waves-light js-remove" 
                      data-id="${c.id}"
                      data-csrf="${csrf}"
                    >delete</button>
                  </td>
                </tr>
              `
            }).join('')
            $card.querySelector('.table1').innerHTML = html
            $card.querySelector('.priceValue').textContent = card.price
          } else {
            $card.innerHTML = `<p>Card is empty</p>`
          }
        })

    }
  })
}

const toDate = date => {
  return new Intl.DateTimeFormat('ua-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

M.Tabs.init(document.querySelectorAll('.tabs'))

const newError = document.querySelector('.alert')

if (newError) {
  setTimeout(() => {
    newError.style.display = 'none'
  }, 6000)
}

