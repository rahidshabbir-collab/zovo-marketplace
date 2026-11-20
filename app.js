// ZOVO marketplace — Supabase authentication connection
const SUPABASE_URL = "https://zwxjfomuccsaxybndwts.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0L_-XdahTrZ9PT9AhwlAIA_74EWeUCa";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
let authMode = "signup";
let authBusy = false;
const $ = s => document.querySelector(s);
const productGrid = $("#productGrid");
const toast = msg => { $("#toast").textContent=msg; $("#toast").classList.add("show"); setTimeout(()=>$("#toast").classList.remove("show"),2600); };

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

function setAuthMode(mode){
  authMode=mode;
  const signup=mode==="signup";
  $("#authTitle").textContent=signup?"Create your account":"Log in to ZOVO";
  $("#authIntro").textContent=signup?"Create a customer or seller account.":"Enter your email and password.";
  $("#nameField").hidden=!signup;
  $("#roleField").hidden=!signup;
  $("#shopField").hidden=!signup || $("#authRole").value!=="seller";
  $("#authPassword").autocomplete=signup?"new-password":"current-password";
  $("#authSubmit").textContent=signup?"Create account":"Log in";
  $("#switchAuth").textContent=signup?"Already have an account? Log in":"New to ZOVO? Create an account";
}
function openAuth(mode){setAuthMode(mode);$("#authDialog").showModal();}
$("#authRole").addEventListener("change",()=>{$("#shopField").hidden=authMode!=="signup"||$("#authRole").value!=="seller";});
$("#switchAuth").onclick=()=>setAuthMode(authMode==="signup"?"login":"signup");
$("#closeAuth").onclick=()=>$("#authDialog").close();
$("#signupButton").onclick=()=>openAuth("signup");
$("#loginButton").onclick=()=>openAuth("login");
$("#sellHero").onclick=()=>{openAuth("signup");$("#authRole").value="seller";$("#authRole").dispatchEvent(new Event("change"));};
$("#sellBanner").onclick=()=>{openAuth("signup");$("#authRole").value="seller";$("#authRole").dispatchEvent(new Event("change"));};

$("#authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(authBusy)return;
  authBusy=true;$("#authSubmit").disabled=true;
  const email=$("#authEmail").value.trim();
  const password=$("#authPassword").value;
  try{
    if(authMode==="signup"){
      const fullName=$("#authName").value.trim();
      const role=$("#authRole").value;
      const shopName=$("#authShop").value.trim();
      if(role==="seller"&&!shopName){toast("Please enter your shop name.");return;}
      const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{full_name:fullName,account_type:role,shop_name:role==="seller"?shopName:null}}});
      if(error)throw error;
      if(data.user && data.session){
        await ensureUserRecords(data.user);
        $("#authDialog").close();$("#authForm").reset();
        toast(role==="seller"?"Seller account and shop created!":"Customer account created!");
      }else{
        $("#authDialog").close();
        toast("Check your email to confirm your ZOVO account, then log in.");
      }
    }else{
      const {error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      $("#authDialog").close();$("#authForm").reset();
      toast("You are logged in to ZOVO.");
    }
    await refreshAuthButton();
  }catch(err){toast(err.message||"Something went wrong. Please try again.");}
  finally{authBusy=false;$("#authSubmit").disabled=false;}
});
async function ensureUserRecords(user){
  const fullName = user.user_metadata?.full_name || "";
  const {data:profile,error:profileReadError}=await supabaseClient.from("profiles").select("id").eq("id",user.id).maybeSingle();
  if(profileReadError)throw profileReadError;
  if(!profile){
    const {error}=await supabaseClient.from("profiles").insert({id:user.id,full_name:fullName});
    if(error)throw error;
  }
  if(user.user_metadata?.account_type==="seller"){
    const {data:shop,error:shopReadError}=await supabaseClient.from("shops").select("id").eq("owner_id",user.id).maybeSingle();
    if(shopReadError)throw shopReadError;
    if(!shop){
      const shopName=user.user_metadata?.shop_name || "My ZOVO Shop";
      const {error}=await supabaseClient.from("shops").insert({owner_id:user.id,shop_name:shopName});
      if(error)throw error;
    }
  }
}
async function refreshAuthButton(){
  const {data:{user}}=await supabaseClient.auth.getUser();
  if(user){
    try{await ensureUserRecords(user);}catch(err){console.error("ZOVO profile setup:",err);}
    $("#loginButton").textContent="Account";$("#signupButton").textContent="Log out";
  } else {$("#loginButton").textContent="Login";$("#signupButton").textContent="Sign Up";}
}
$("#signupButton").addEventListener("click",async e=>{
  const {data:{user}}=await supabaseClient.auth.getUser();
  if(user){e.stopImmediatePropagation();await supabaseClient.auth.signOut();await refreshAuthButton();toast("You are logged out.");}
},true);
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
renderProducts();renderCart();refreshAuthButton();
