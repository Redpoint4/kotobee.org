// Dashboard için UserManager (Register ve Login ile uyumlu)
const UserManager = {
	jsonFilePath: 'data/users.json',
	
	// JSON dosyasından kullanıcıları yükle
	loadUsersFromJSON: async function() {
		try {
			const response = await fetch(this.jsonFilePath);
			if (response.ok) {
				const users = await response.json();
				return Array.isArray(users) ? users : [];
			}
		} catch (e) {
			console.log('JSON file not found or error loading:', e);
		}
		return [];
	},
	
	// Kullanıcı bul (önce LocalStorage, sonra JSON)
	findUser: async function(email) {
		try {
			// Önce LocalStorage'dan kontrol et
			const users = JSON.parse(localStorage.getItem('kotobee_users') || '[]');
			let user = users.find(u => u.email === email);
			
			// LocalStorage'da yoksa JSON'dan yükle
			if (!user) {
				const jsonUsers = await this.loadUsersFromJSON();
				user = jsonUsers.find(u => u.email === email);
				
				// JSON'dan bulunursa LocalStorage'a ekle
				if (user) {
					let localUsers = JSON.parse(localStorage.getItem('kotobee_users') || '[]');
					localUsers.push(user);
					localStorage.setItem('kotobee_users', JSON.stringify(localUsers));
				}
			}
			
			return user || null;
		} catch (e) {
			console.error('Error finding user:', e);
			return null;
		}
	},
	
	// Mevcut kullanıcıyı al
	getCurrentUser: function() {
		try {
			return JSON.parse(localStorage.getItem('kotobee_current_user') || 'null');
		} catch (e) {
			return null;
		}
	},
	
	// Logout
	logout: function() {
		localStorage.removeItem('kotobee_current_user');
		window.location.href = '../login';
	},
	
	// Tüm kullanıcı bilgilerini al
	getFullUserData: async function(email) {
		return await this.findUser(email);
	}
};

// Dashboard başlatma
document.addEventListener('DOMContentLoaded', function() {
	// Login kontrolü
	const currentUser = UserManager.getCurrentUser();
	
	if (!currentUser || !currentUser.email) {
		// Giriş yapılmamışsa login'e yönlendir
		window.location.href = '../login';
		return;
	}
	
	// Kullanıcı bilgilerini yükle ve göster
	loadUserDashboard(currentUser.email);
	
	// Logout butonu
	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', function(e) {
			e.preventDefault();
			if (confirm('Are you sure you want to logout?')) {
				UserManager.logout();
			}
		});
	}
});

// Kullanıcı dashboard'unu yükle
async function loadUserDashboard(email) {
	try {
		const user = await UserManager.getFullUserData(email);
		
		if (!user) {
			// Kullanıcı bulunamadı
			document.getElementById('dashboardContent').innerHTML = 
				'<div class="alert alert-danger">User not found. Please login again.</div>';
			return;
		}
		
		// Kullanıcı bilgilerini göster
		displayUserInfo(user);
		
	} catch (error) {
		console.error('Error loading dashboard:', error);
		document.getElementById('dashboardContent').innerHTML = 
			'<div class="alert alert-danger">Error loading dashboard. Please try again.</div>';
	}
}

// Kullanıcı bilgilerini göster
function displayUserInfo(user) {
	const dashboardContent = document.getElementById('dashboardContent');
	if (!dashboardContent) return;
	
	const loginTime = user.loginTime || new Date().toISOString();
	const registeredAt = user.registeredAt || 'N/A';
	
	// Tarih formatla
	const formatDate = (dateString) => {
		if (!dateString || dateString === 'N/A') return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch (e) {
			return dateString;
		}
	};
	
	dashboardContent.innerHTML = `
		<div class="dashboard-welcome">
			<h1 class="mainVertifyHeading">Welcome, ${user.name || user.email}!</h1>
			<p class="box">This is your personal dashboard. Here you can view and manage your account information.</p>
		</div>
		
		<div class="vSpace20"></div>
		
		<div class="dashboard-info">
			<div class="row">
				<div class="col-md-6">
					<div class="info-card">
						<h3>Account Information</h3>
						<div class="info-item">
							<strong>Email:</strong> ${user.email || 'N/A'}
						</div>
						<div class="info-item">
							<strong>Name:</strong> ${user.name || 'Not provided'}
						</div>
						<div class="info-item">
							<strong>Phone:</strong> ${user.phone || 'Not provided'}
						</div>
						<div class="info-item">
							<strong>Age:</strong> ${user.age || 'Not provided'}
						</div>
						<div class="info-item">
							<strong>Affiliate Code:</strong> ${user.affiliate || 'Not provided'}
						</div>
					</div>
				</div>
				
				<div class="col-md-6">
					<div class="info-card">
						<h3>Account Details</h3>
						<div class="info-item">
							<strong>Registered:</strong> ${formatDate(registeredAt)}
						</div>
						<div class="info-item">
							<strong>Last Login:</strong> ${formatDate(loginTime)}
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div class="vSpace20"></div>
		
		<div class="dashboard-actions">
			<button id="logoutBtn" class="btn btn-danger">Logout</button>
			<a href="../" class="btn btn-default">Go to Home</a>
		</div>
	`;
	
	// Logout butonu event listener'ı tekrar ekle (dinamik içerik için)
	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', function(e) {
			e.preventDefault();
			if (confirm('Are you sure you want to logout?')) {
				UserManager.logout();
			}
		});
	}
}

