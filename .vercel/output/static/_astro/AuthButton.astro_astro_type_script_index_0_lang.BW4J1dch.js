import{s as r}from"./Layout.astro_astro_type_script_index_0_lang.B46Rr_z_.js";class a extends HTMLElement{constructor(){super()}connectedCallback(){this.checkAuth()}async checkAuth(){try{const{data:{user:t}}=await r.auth.getUser();t&&this.renderDashboard()}catch(t){console.error("Error checking auth:",t)}}renderDashboard(){this.innerHTML=`
                <div class="auth-button-group">
                    <a href="/dashboard" class="btn-primary">Dashboard</a>
                </div>
            `}}customElements.define("auth-button",a);
