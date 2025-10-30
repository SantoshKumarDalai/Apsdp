"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ---- Navbar Active Link Handling ----
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.getElementById('navbarNavDropdown');

    // When link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Remove active class from all nav links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to the clicked link
            this.classList.add('active');

            // Close mobile menu after clicking
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) bsCollapse.hide();
        });
    });

    // Scroll-based active highlight
    window.addEventListener('scroll', () => {
        const fromTop = window.scrollY + 100; // offset for sticky navbar
        navLinks.forEach(link => {
            const section = document.querySelector(link.hash);
            if (
                section &&
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // ---------------- Banner Slider ----------------
    var swiper = new Swiper(".mySwiper", {
        effect: "fade",
        fadeEffect: { crossFade: true },
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        pagination: { el: ".swiper-pagination", clickable: true },
        on: {
            slideChangeTransitionStart: function () {
                let activeSlide = document.querySelector(".swiper-slide-active");
                let pixelDiv = document.createElement("div");
                pixelDiv.className = "pixel-transition";
                pixelDiv.innerHTML = `
                    <div></div><div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div><div></div>
                `;
                let imgContainer = activeSlide.querySelector(".banner-img");
                if (imgContainer) {
                    imgContainer.appendChild(pixelDiv);
                    setTimeout(() => pixelDiv.remove(), 1500);
                }
            }
        }
    });

    function animateActiveSlide() {
        document.querySelectorAll('.swiper-slide .content').forEach(c => c.classList.remove('animate-in'));
        const activeContent = document.querySelector('.swiper-slide-active .content');
        if (activeContent) {
            void activeContent.offsetWidth;
            activeContent.classList.add('animate-in');
        }
    }

    setTimeout(() => animateActiveSlide(), 100);
    swiper.on('slideChangeTransitionStart', animateActiveSlide);

    // ---------------- Search & Category Filtering ----------------
    const searchInput = document.querySelector('.search-box input');
    const productCards = document.querySelectorAll('.product-card');
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryButtons = categoryDropdown.querySelectorAll('button');
    let selectedCategory = null;

    // --- Suggestions dropdown ---
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    searchInput.parentElement.appendChild(suggestionsContainer);

    function filterProducts() {
        const searchText = searchInput.value.trim().toLowerCase();
        productCards.forEach(card => {
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            const desc = card.querySelector('.product-desc').textContent.toLowerCase();
            const category = card.querySelector('.product-category span').textContent.toLowerCase();
            const matchesSearch = !searchText || name.includes(searchText) || desc.includes(searchText);
            const matchesCategory = !selectedCategory || category === selectedCategory.toLowerCase();
            card.parentElement.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
        });
    }

    function updateSuggestions() {
        const searchText = searchInput.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';
        if (!searchText) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const matches = Array.from(productCards).filter(card => {
            return card.querySelector('.product-name').textContent.toLowerCase().includes(searchText);
        });

        if (matches.length === 0) {
            const noItem = document.createElement('div');
            noItem.textContent = 'No matching products';
            noItem.style.color = '#888';
            suggestionsContainer.appendChild(noItem);
        } else {
            matches.forEach(card => {
                const suggestion = document.createElement('div');
                suggestion.textContent = card.querySelector('.product-name').textContent;
                suggestion.addEventListener('click', () => {
                    searchInput.value = suggestion.textContent;
                    selectedCategory = null;
                    categoryButtons.forEach(b => b.classList.remove('active'));
                    categoryBtn.querySelector('span')?.remove();
                    filterProducts();
                    suggestionsContainer.style.display = 'none';
                });
                suggestion.addEventListener('mouseenter', () => suggestion.style.background = '#f0f0f0');
                suggestion.addEventListener('mouseleave', () => suggestion.style.background = '#fff');
                suggestionsContainer.appendChild(suggestion);
            });
        }

        suggestionsContainer.style.display = 'block';
    }

    searchInput.addEventListener('input', () => {
        filterProducts();
        updateSuggestions();
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            selectedCategory = null;
            categoryButtons.forEach(b => b.classList.remove('active'));
            categoryBtn.querySelector('span')?.remove();
            filterProducts();
            suggestionsContainer.style.display = 'none';
        }
    });

    // --- Category dropdown ---
    if (categoryBtn && categoryDropdown) {
        categoryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryDropdown.style.display =
                categoryDropdown.style.display === 'block' ? 'none' : 'block';
        });

        categoryDropdown.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('click', () => categoryDropdown.style.display = 'none');

        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (selectedCategory === btn.textContent.trim()) {
                    selectedCategory = null;
                    categoryButtons.forEach(b => b.classList.remove('active'));
                    categoryBtn.querySelector('span')?.remove();
                } else {
                    selectedCategory = btn.textContent.trim();
                    categoryButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    categoryBtn.querySelector('span')?.remove();
                    const selectedLabel = document.createElement('span');
                    selectedLabel.textContent = ` (${selectedCategory})`;
                    selectedLabel.style.fontWeight = 'normal';
                    selectedLabel.style.fontSize = '0.9em';
                    categoryBtn.appendChild(selectedLabel);
                }
                categoryDropdown.style.display = 'none';
                filterProducts();
            });
        });
    }

    filterProducts();

    // ---------------- Modal + PDF Handling ----------------
    const form = document.getElementById('contactForm');
    const status = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    const generateBtn = document.getElementById('generatePdf'); // manual download

    const showStatus = (text, isError = false) => {
        if (!status) return;
        status.textContent = text;
        status.style.color = isError ? '#b91c1c' : '';
    };

    const generatePDF = async () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const margin = 40;
            let y = 60;
            doc.setFontSize(20);
            doc.setFont('Inter', 'bold');
            doc.text('Company Brochure', margin, y);
            y += 26;
            doc.setFontSize(11);
            doc.setFont('Inter', 'normal');
            doc.text('Thank you for your interest. Here are the details you provided:', margin, y);
            y += 20;
            doc.line(margin, y, 595 - margin, y);
            y += 18;

            const fields = [
                ['Name:', document.getElementById('name')?.value || '-'],
                ['Mobile:', document.getElementById('phone')?.value || '-'],
                ['Email:', document.getElementById('email')?.value || '-'],
                ['Address:', document.getElementById('address')?.value || '-'],
                ['Notes:', document.getElementById('notes')?.value || '-']
            ];

            doc.setFontSize(12);
            for (const [label, value] of fields) {
                doc.setFont('Inter', 'bold');
                doc.text(label, margin, y);
                doc.setFont('Inter', 'normal');
                const split = doc.splitTextToSize(value, 595 - margin * 2 - 80);
                doc.text(split, margin + 80, y);
                y += (split.length * 14) + 8;
                if (y > 720) { doc.addPage(); y = 40; }
            }

            if (y + 120 > 820) { doc.addPage(); y = 60; }
            doc.setFont('Inter', 'bold');
            doc.setFontSize(14);
            doc.text('About Our Services', margin, y + 6);
            doc.setFontSize(11);
            doc.setFont('Inter', 'normal');
            const aboutText = 'We offer a range of solutions tailored to your needs — from consulting and implementation to support.';
            const aboutLines = doc.splitTextToSize(aboutText, 595 - margin * 2);
            doc.text(aboutLines, margin, y + 28);

            const nameVal = document.getElementById('name')?.value.trim() || 'Guest';
            const filename = `Brochure_${nameVal.replace(/\s+/g, '_')}.pdf`;
            await new Promise(resolve => setTimeout(resolve, 200)); // ensure download before closing
            doc.save(filename);
            showStatus('Your personalized brochure has been downloaded!');
        } catch (err) {
            console.error(err);
            showStatus('Error creating PDF.', true);
        }
    };

    // Auto download after form submission
    submitBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!form?.checkValidity()) {
            form?.reportValidity();
            return showStatus('Please fix validation errors before submitting.', true);
        }
        showStatus('Submitting info and generating brochure...');
        await generatePDF();
        setTimeout(() => {
            const modalEl = document.getElementById('exampleModalCenter');
            let modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (!modalInstance) modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.hide();
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            form.reset();
        }, 1000);
    });

    // Manual download button
    generateBtn?.addEventListener('click', async () => {
        showStatus('Preparing your brochure...');
        await generatePDF();
    });

});

// ---- Nav Toggle -----
const toggleButton = document.querySelector('.navbar-toggler');
const toggleIcon = document.getElementById('navbarToggleIcon');
const navbarCollapse = document.getElementById('navbarNavDropdown');

// Bootstrap collapse event listeners
navbarCollapse.addEventListener('show.bs.collapse', function () {
    toggleIcon.classList.remove('bi-list');
    toggleIcon.classList.add('bi-x');
});

navbarCollapse.addEventListener('hide.bs.collapse', function () {
    toggleIcon.classList.remove('bi-x');
    toggleIcon.classList.add('bi-list');
});

// Disable click to toggle dropdown on large screens
document.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth >= 992) {
        document.querySelectorAll('.dropdown-hover .dropdown-toggle').forEach(function (el) {
            el.removeAttribute('data-bs-toggle');
        });
    }
});