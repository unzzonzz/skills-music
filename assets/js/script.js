const $ = (q) => document.querySelector(q)
const $$ = (q) => [...document.querySelectorAll(q)]
let albums = []
let filteredAlbums = []
let searchedAlbums = []
let cart = []
const categories = [
    {
        label: 'ALL',
        icon: 'fa-th-list'
    },
    {
        label: '발라드',
        icon: 'fa-youtube-play'
    },
    {
        label: '랩힙합',
        icon: 'fa-youtube-play'
    },
    {
        label: '댄스',
        icon: 'fa-youtube-play'
    },
    {
        label: '포크어코스틱',
        icon: 'fa-youtube-play'
    },
    {
        label: '트로트',
        icon: 'fa-youtube-play'
    },
    {
        label: '재즈',
        icon: 'fa-youtube-play'
    },
    {
        label: '락메탈',
        icon: 'fa-youtube-play'
    },
    {
        label: 'R&B',
        icon: 'fa-youtube-play'
    },
    {
        label: '팝',
        icon: 'fa-youtube-play'
    }
]
let currentCategory
let keyword

async function loadData() {
    let id = 1
    albums = await fetch('music_data.json').then(res => res.json()).then(json => json.data.map(data => ({...data, id: id++ })).toSorted((a, b) => b.release.localeCompare(a.release)))
    cart = JSON.parse(localStorage.getItem('cart')) ?? []
    currentCategory = localStorage.getItem('currentCategory') ?? 'ALL'
    filteredAlbums = albums
    keyword = localStorage.getItem('keyword')
    $('.search input').value = keyword
    
    init()
}

function setData() {
    localStorage.setItem('keyword', keyword)
    localStorage.setItem('currentCategory', currentCategory)
    localStorage.setItem('cart', JSON.stringify(cart))
}

function render() {
    $('#page-inner h2').textContent = currentCategory

    $('.modal-footer .btn-primary').onclick = () => payOrder()

    $('.modal-body tbody').innerHTML = ''
    cart.forEach(item => {
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td class="albuminfo">
                <img src="images/${item.albumJaketImage}">
                <div class="info">
                    <h4>${item.albumName}</h4>
                    <span>
                        <i class="fa fa-microphone"> 아티스트</i> 
                        <p>${item.artist}</p>
                    </span>
                    <span>
                        <i class="fa  fa-calendar"> 발매일</i> 
                        <p>${item.release}</p>
                    </span>
                </div>
            </td>
            <td class="albumprice">
                ￦ ${Number(item.price.replace('원', '')).toLocaleString()}
            </td>
            <td class="albumqty">
                <input type="number" class="form-control" value="${item.count}" onchange="changeAlbumCount(${item.id}, this.value)">
            </td>
            <td class="pricesum">
                ￦ ${(Number(item.price.replace('원', '')) * item.count).toLocaleString()}
            </td>
            <td>
                <button class="btn btn-default" onclick="deleteFromCart(${item.id})">
                    <i class="fa fa-trash-o"></i> 삭제
                </button>
            </td>
        `

        $('.modal-body tbody').append(tr)
    })

    let totalPrice = 0
    cart.forEach(item => totalPrice += +item.price.replace('원', '') * item.count)
    $('.panel-body > button').innerHTML = `
        <i class="fa fa-shopping-cart"></i> 쇼핑카트 <strong>${cart.length}</strong> 개 금액 ￦ ${totalPrice.toLocaleString()}</a> 
    `
    $('.totalprice').innerHTML = `
        <h3>총 합계금액 : <span>￦${totalPrice.toLocaleString()}</span> 원</h3>
    `

    $$('.category a').forEach(a => {
        a.classList.toggle('active-menu', a.dataset.category === currentCategory)
    })

    $('.contents.col-md-12').innerHTML = ''

    keyword = $('.search input').value.trim()
    setData()

    currentCategory === 'ALL' ? filteredAlbums = albums : filteredAlbums = albums.filter(album => album.category === currentCategory)
    searchedAlbums = filteredAlbums.filter(album => album.albumName.includes(keyword) || album.artist.includes(keyword))

    searchedAlbums.forEach(album => {
        let isExists = cart.find(item => item.id === album.id)
        const div = document.createElement('div')
        div.classList.add('col-md-2', 'col-sm-2', 'col-xs-2', 'product-grid')
        div.innerHTML = `
            <div class="product-items">
                <div class="project-eff">
                    <img class="img-responsive" src="images/${album.albumJaketImage}" alt="Time for the moon night">
                </div>
                <div class="produ-cost">
                    <h5>${album.albumName.replaceAll(keyword, `<mark>${keyword}</mark>`)}</h5>
                    <span>
                        <i class="fa fa-microphone"> 아티스트</i> 
                        <p>${album.artist.replaceAll(keyword, `<mark>${keyword}</mark>`)}</p>
                    </span>
                    <span>
                        <i class="fa  fa-calendar"> 발매일</i> 
                            
                        <p>${album.release}</p>
                    </span>
                    <span>
                        <i class="fa fa-money"> 가격</i>
                        <p>￦${Number(album.price.replace('원', '')).toLocaleString()}</p>
                    </span>
                    <span class="shopbtn">
                        <button class="btn btn-default btn-xs" onclick="addToCart(${album.id})">
                            <i class="fa fa-shopping-cart"></i> ${isExists ? `추가하기 ${isExists.count}개` : '장바구니 담기'}
                        </button>
                    </span>
                </div>
            </div>
        `

        $('.contents.col-md-12').append(div)
    })

    if (!searchedAlbums[0]) alert('검색된 앨범이 없습니다.')
}

function deleteFromCart(id) {
    if (confirm('정말 삭제 하시겠습니까?')) cart = cart.filter(item => item.id !== id)

    render()
}

function changeAlbumCount(id, count) {
    const item = cart.find(item => item.id === id)
    item.count = +count > 0 ? +count : 1

    render()
}

function categoryFilter() {
    categories.forEach(category => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        const i = document.createElement('i')
        const span = document.createElement('span')
        li.classList.add('category')
        a.href = '#'
        a.dataset.category = category.label
        i.classList.add('fa', 'fa-2x', category.icon)
        span.textContent = category.label

        a.onclick = () => {
            currentCategory = category.label
            
            render()
        }

        a.append(i)
        a.append(span)
        li.append(a)
        $('.nav').append(li)
    })
}

function addToCart(id) {
    const isExists = cart.find(item => item.id === id)
    const item = albums.find(item => item.id === id)
    if (isExists) {
        isExists.count++
    } else {
        cart.push({ id: id, albumJaketImage: item.albumJaketImage, albumName: item.albumName, artist: item.artist, release: item.release, price: item.price, count: 1 })
    }
    
    render()
}

function payOrder() {
    cart = []
    alert('결제가 완료되었습니다.')

    render()
}

$('.search button').onclick = () => render()
$('.search input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') render()
})

function init() {
    $$('.nav li').forEach(li => {
        if (!li.classList.contains('text-center')) li.remove()
    })
    
    categoryFilter()
    render()
}

loadData()