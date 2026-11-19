const products = [
  {id:1,name:"Studio wireless headphones",category:"Electronics",price:79.00,emoji:"🎧",seller:"Nova Audio"},
  {id:2,name:"Everyday leather tote",category:"Fashion",price:64.50,emoji:"👜",seller:"Atelier Lane"},
  {id:3,name:"Minimal ceramic vase",category:"Home",price:32.00,emoji:"🏺",seller:"Forma Living"},
  {id:4,name:"Botanical skincare set",category:"Beauty",price:42.00,emoji:"🧴",seller:"Kindred Botanics"},
  {id:5,name:"Performance running shoes",category:"Sports",price:89.00,emoji:"👟",seller:"Pace Studio"},
  {id:6,name:"Modern wristwatch",category:"Fashion",price:115.00,emoji:"⌚",seller:"Meridian Goods"}
];
let cart = [];
let activeCategory = "All";
let urdu = false;
const $ = s => document.querySelector(s);
const productGrid = $("#productGrid");
const toast = msg => { $("#toast").textContent=msg; $("#toast").classList.add("show"); setTimeout(()=>$("#toast").classList.remove("show"),2200); };
function renderProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const filtered=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.seller}`).toLowerCase().includes(q));
  productGrid.innerHTML=filtered.map(p=>`<article class="product-card"><div class="product-art">${p.emoji}</div><div class="product-info"><small>${p.category.toUpperCase()} · ${p.seller}</small><h3>${p.name}</h3><div class="product-bottom"><span class="price">$${p.price.toFixed(2)}</span><button class="add-btn" data-add="${p.id}">＋ Add to cart</button></div></div></article>`).join("")||'<p class="muted">No products found. Try another search.</p>';
  $("#resultCount").textContent=`${filtered.length} products`;
}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((n,x)=>n+x.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><span class="cart-emoji">${x.emoji}</span><div style="flex:1"><b>${x.name}</b><small>$${x.price.toFixed(2)} × ${x.qty}</small></div><button class="add-btn" data-remove="${x.id}">Remove</button></div>`).join(""):'<p class="muted">Your cart is empty.</p>';
  $("#cartTotal").textContent="$"+cart.reduce((n,x)=>n+x.price*x.qty,0).toFixed(2);
}
productGrid.addEventListener("click",e=>{const id=Number(e.target.dataset.add);if(!id)return;const p=products.find(x=>x.id===id);const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({...p,qty:1});renderCart();toast("Added to your cart");});
$("#cartItems").addEventListener("click",e=>{const id=Number(e.target.dataset.remove);if(!id)return;cart=cart.filter(x=>x.id!==id);renderCart();});
$("#categoryGrid").addEventListener("click",e=>{const card=e.target.closest("[data-category]");if(!card)return;activeCategory=card.dataset.category;document.querySelectorAll(".category-card").forEach(x=>x.classList.toggle("active",x===card));renderProducts();});
$("#searchInput").addEventListener("input",renderProducts);
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();renderProducts();$("#products").scrollIntoView({behavior:"smooth"});});
function openCart(){ $("#cartDrawer").classList.add("open");$("#backdrop").classList.add("show");}
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("show");}
$("#cartButton").onclick=openCart;$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;
function openSeller(){ $("#sellerDialog").showModal(); }
$("#sellHero").onclick=openSeller;$("#sellBanner").onclick=openSeller;
$("#sellerForm").addEventListener("submit",e=>{e.preventDefault();$("#sellerDialog").close();toast("Demo seller profile completed — connect a backend to save it.");e.target.reset();});
$("#signupButton").onclick=()=>toast("Account signup will be enabled when authentication is connected.");
$("#loginButton").onclick=()=>toast("Login will be enabled when authentication is connected.");
$("#wishlistButton").onclick=()=>toast("Wishlist feature is planned for the next build.");
$("#checkoutButton").onclick=()=>toast("Demo checkout only — no payment has been taken.");
$("#languageToggle").onclick=()=>{
  urdu=!urdu;document.body.classList.toggle("urdu",urdu);document.documentElement.lang=urdu?"ur":"en";
  document.querySelectorAll("[data-en]").forEach(el=>{el.innerHTML=urdu?el.dataset.ur:el.dataset.en;});
  $("#languageToggle").textContent=urdu?"English":"اردو";
};
$("#categoryToggle").onclick=()=>$("#categories").scrollIntoView({behavior:"smooth"});
$("#allCategories").onclick=()=>{activeCategory="All";document.querySelectorAll(".category-card").forEach(x=>x.classList.toggle("active",x.dataset.category==="All"));renderProducts();};
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();
