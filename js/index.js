(function() {

	class Doctors {
		doctorsList;
		doctorsListCache;
		slots = {
			"6-9" : 'Morning',
			"9-12" : 'Morning',
			"12-3" : 'Afternoon',
			"12-15" : 'Afternoon',
			"15-18" : 'Afternoon',
			"18-21" : 'Evening',
			"21-24" : 'Night',
		};
		cityFilter = document.getElementById('cityFilter');
		localityFilter = document.getElementById('localityFilter');
		timeFilter = document.getElementById('timeFilter');
		selectedCity;
		selectedLocality;
		selectedSlot;

		constructor() {
			this.doctorsListContainer = document.getElementById('doctorsList');
			this.priceSort = document.getElementById('priceSort');
			this.ratingSort = document.getElementById('ratingSort');
			this.cityList = [];
			this.localityList = [];
			this.timeList = Object.keys(this.slots);
			this.fetchDoctorList();
			this.bookNow = this.bookNow.bind(this);
		}

		fetchDoctorList() {
			fetch('http://api.myjson.com/bins/g5jbq')
				.then(res => res.json())
				.then(res => {
					res.sort((a,b) => a.price - b.price)
					this.doctorsList = JSON.parse(JSON.stringify(res));
					this.doctorsListCache = JSON.parse(JSON.stringify(res));
					this.renderDoctorList(this.doctorsList);
					this.renderFilters();
					this.addEventListeners();
				}).catch(err => {
					alert('Site is down. Please try after sometime');
				});
		}

		renderDoctorList(doctorsList) {
			if (doctorsList.length === 0) {
				this.doctorsListContainer.innerHTML = `<div>No result found</div>`;
				return;
			}
			this.doctorsListContainer.innerHTML =  doctorsList.map((item) => {
				if (this.cityList.indexOf(item.city) === -1) {
					this.cityList.push(item.city);
				}
				if (this.localityList.indexOf(item.city) === -1) {
					this.localityList.push(item.locality);
				}
				return `<div class="doctor">
					<div class="bookingDetail">
						<div class="doctorDetail">
							<img src="https://via.placeholder.com/100" />
							<div>
								<p>Name : ${item.name}</p>
								<p>Address : ${item.city}, ${item.locality}</p>
								<p>Rating : ${this.addRating(item.rating)}</p>
							</div>
						</div>
						<div class="priceAndBook">
							<span class="price">
								${item.price} Rs
							</span>
							<button data-id="${item.id}" class="btn btn-grad bookNow">Book now</button>
						</div>
					</div>
					<div class="slots">
						${this.renderSlot(item.available_slots, item.id)}
					</div>
				</div>`
			}).join('');
			this.addButtonEventListeners();
		}

		addRating(rating) {
			let color;
			if (rating > 2 && rating < 3) {
				color = '#ff9f00';
			} else if (rating < 2) {
				color = '#ff6161';
			} else if (rating < 4) {
				color = '#26a541';
			} else {
				color = '#05661a';
			}
			return `<span class="rating" style="background: ${color}">${rating}</span>`;
		}

		renderSlot(availableSlots, id) {
			return availableSlots.map((slot, i) => {
				return `<label for="radio_${id}_${i}"> <input type="radio" value="${slot}" name="radio_${id}" id="radio_${id}_${i}" /> ${this.slots[slot]} ${slot}</label>`;
			}).join('');
		}

		renderFilters() {
			this.cityFilter.innerHTML = '<option value="">Filter by city</option>' + this.cityList.map(city => `<option value="${city}">${city}</option>`).join('');
			this.localityFilter.innerHTML = '<option value="">Filter by locality</option>' + this.localityList.map(locality => `<option value="${locality}">${locality}</option>`).join('');
			this.timeFilter.innerHTML = '<option value="">Filter by time slot</option>' +  this.timeList.map(locality => `<option value="${locality}">${locality}</option>`).join('');
		}

		addEventListeners() {
			this.cityFilter.addEventListener('change', (e) => {
				this.selectedCity = e.target.value;
				this.filterByCity(this.selectedCity);
			});
			this.localityFilter.addEventListener('change', (e) => {
				this.selectedLocality = e.target.value; 
				this.filterByLocality(this.selectedLocality);
			});
			this.timeFilter.addEventListener('change', (e) => {
				this.selectedSlot = e.target.value;
				this.filterByTimeSlot(this.selectedSlot);
			});
			this.priceSort.addEventListener('change', (e) => {
				this.sortBy(e.target.value, 'price');
			});
			this.ratingSort.addEventListener('change', (e) => {
				this.sortBy(e.target.value, 'rating');
			});
		}

		addButtonEventListeners() {
			this.buttons = document.getElementsByClassName('bookNow');
			for(let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].addEventListener('click', this.bookNow);
			}
		}

		removeButtonEventListener(){ 
			for(let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].removeEventListener('click', this.bookNow);
			}
		}

		bookNow(e) {
			let list = e.target.parentElement.parentElement.parentElement.getElementsByClassName('slots')[0].getElementsByTagName('input');
			let selected = false;
			let selectedVal;
			for(let i = 0; i < list.length ; i++ ) {
				if (list[i].checked) {
					selected = list[i].checked;
					selectedVal = list[i].value;
					break;
				}
			}
			if (selected) {
				let clinicId = e.target.getAttribute('data-id');
				let res = this.doctorsList.find(item => item.id === clinicId);
				alert(`You are appointing to ${res.name} at ${res.city}, ${res.locality} .Timing between ${selectedVal}`);
			} else {
				alert('Please select slot');
			}
		}

		sortBy(val, field) {
			if (val === 'htl') {
				this.renderDoctorList(this.doctorsList.sort((a,b) => b[field] - a[field]))
			} else {
				this.renderDoctorList(this.doctorsList.sort((a,b) => a[field] - b[field]))
			}
		}

		filterByCity(value) {
			this.removeButtonEventListener();
			this.doctorsList = JSON.parse(JSON.stringify(this.doctorsListCache));
			this.localityFilter.value = "";
			this.timeFilter.value = "";
			if (value === '') {
				this.renderDoctorList(this.doctorsList);
				return;	
			}
			this.doctorsList = this.doctorsList.filter(item => item.city === value);
			this.renderDoctorList(this.doctorsList);
		}

		filterByLocality(value) {
			this.removeButtonEventListener();
			this.doctorsList = JSON.parse(JSON.stringify(this.doctorsListCache));
			if (this.selectedCity) {
				this.doctorsList = this.doctorsList.filter(item => item.city === this.selectedCity)	
			}
			if (this.selectedSlot) {
				this.doctorsList = this.doctorsList.filter(item => item.available_slots.indexOf(this.selectedSlot) > -1)	
			}
			if (value !== '') {
				this.doctorsList = this.doctorsList.filter(item => item.locality === value);
			}
			this.renderDoctorList(this.doctorsList);
		}

		filterByTimeSlot(value) {
			this.removeButtonEventListener();
			this.doctorsList = JSON.parse(JSON.stringify(this.doctorsListCache));
			if (this.selectedCity) {
				this.doctorsList = this.doctorsList.filter(item => item.city === this.selectedCity)	
			}
			if (this.selectedLocality) {
				this.doctorsList = this.doctorsList.filter(item => item.locality === this.selectedLocality)	
			}
			if (value !== '') {
				this.doctorsList = this.doctorsList.filter(item => item.available_slots.indexOf(value) > -1);
			}
			this.renderDoctorList(this.doctorsList);
		}
	}

	let doctors = new Doctors();

})();