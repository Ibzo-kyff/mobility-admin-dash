'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faBars, faPlayCircle, faSearch, faCar, faCalendarCheck, faRoad, faFilter, faFileContract,
  faShieldAlt, faStar, faStarHalfAlt, faGasPump, faCogs, faUsers, faCheckCircle, faLock, faHeadset,
  faMobileAlt, faMapMarkerAlt, faPhone, faEnvelope, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faHeart, faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { mobilityAPI } from '../../services/mobility-api';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const router = useRouter();
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState('CLIENT');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationVehicule, setReservationVehicule] = useState<any>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const [user, setUser] = useState<any>(null);
  const [marques, setMarques] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalVehicules: number; totalParkings: number } | null>(null);
  const [featuredCar, setFeaturedCar] = useState<any>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Three.js scene reference
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    initializeThreeJS();
    animateThreeJS();
    loadInitialData();
    checkAuth();
    initScrollAnimations();
    window.addEventListener('scroll', updateActiveDot);
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('scroll', updateActiveDot);
      window.removeEventListener('resize', onWindowResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const initializeThreeJS = () => {
    if (!threeContainerRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    threeContainerRef.current.appendChild(renderer.domElement);

    // Create particles
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
      colors[i] = 0.99; // R
      colors[i + 1] = 0.42; // G
      colors[i + 2] = 0.0; // B
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    camera.position.z = 5;

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    particlesRef.current = particles;
  };

  const onWindowResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  };

  const animateThreeJS = () => {
    requestAnimationFrame(animateThreeJS);
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.0003;
      particlesRef.current.rotation.y += 0.0007;
    }
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const currentUser = await mobilityAPI.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const loadInitialData = async () => {
    setShowLoadingOverlay(true);
    try {
      await loadFeaturedCar();
      await loadVehicles();
      await loadMarques();
      await loadStats();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const loadFeaturedCar = async () => {
    const vehicules = await mobilityAPI.getVehicules({ limit: 1 });
    if (vehicules.length > 0) {
      setFeaturedCar(vehicules[0]);
    }
  };

  const loadVehicles = async (filters: Record<string, any> = {}) => {
    if (isLoading) return;
    setIsLoading(true);
    setShowLoadingOverlay(true);
    try {
      const vehicules = await mobilityAPI.getVehicules({ ...filters, page: currentPage, limit: 6 });
      if (currentPage === 1) {
        setAllVehicles(vehicules);
      } else {
        setAllVehicles((prev) => [...prev, ...vehicules]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      showToast('Erreur lors du chargement des véhicules', 'error');
      if (currentPage === 1) {
        setAllVehicles([]);
      }
    } finally {
      setIsLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  const loadMoreVehicles = () => {
    setCurrentPage((prev) => prev + 1);
    loadVehicles();
  };

  const loadMarques = async () => {
    const data = await mobilityAPI.getMarques();
    setMarques(data);
  };

  const loadStats = async () => {
    const data = await mobilityAPI.getStats();
    setStats(data);
  };

  const applyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const filters: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value) filters[key] = value as string;
    });
    setCurrentPage(1);
    loadVehicles(filters);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setShowLoadingOverlay(true);
    try {
      await mobilityAPI.login(email, password);
      showToast('Connexion réussie!', 'success');
      setShowAuthModal(false);
      await checkAuth();
      e.currentTarget.reset();
    } catch (error: any) {
      showToast(error.message || 'Erreur de connexion', 'error');
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
    };
    setShowLoadingOverlay(true);
    try {
      await mobilityAPI.register(userData);
      showToast('Inscription réussie!', 'success');
      setShowAuthModal(false);
      await checkAuth();
      e.currentTarget.reset();
    } catch (error: any) {
      showToast(error.message || "Erreur d'inscription", 'error');
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const handleLogout = () => {
    mobilityAPI.logout();
    setUser(null);
    showToast('Déconnexion réussie', 'success');
  };

  const handleReserve = async (vehiculeId: string) => {
    try {
      if (!mobilityAPI.token) {
        setShowAuthModal(true);
        setAuthTab('login');
        showToast('Veuillez vous connecter pour réserver', 'info');
        return;
      }
      const vehicule = await mobilityAPI.getVehiculeById(vehiculeId);
      setReservationVehicule(vehicule);
      setShowReservationModal(true);
    } catch (error) {
      console.error('Error handling reservation:', error);
      showToast('Erreur lors de la réservation', 'error');
    }
  };

  const submitReservation = async (e: React.FormEvent<HTMLFormElement>, vehiculeId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reservationData = {
      vehiculeId,
      dateDebut: formData.get('dateDebut') as string,
      dateFin: formData.get('dateFin') as string,
      options: formData.getAll('options[]') as string[],
    };
    setShowLoadingOverlay(true);
    try {
      await mobilityAPI.createReservation(reservationData);
      showToast('Réservation confirmée!', 'success');
      setShowReservationModal(false);
    } catch (error: any) {
      showToast(error.message || 'Erreur lors de la réservation', 'error');
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  const showToast = (message: string, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const updateActiveDot = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionBottom = sectionTop + rect.height;
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        setActiveSection(index);
      }
    });
  };

  const initScrollAnimations = () => {
    // Fade-in animations
    document.querySelectorAll('.fade-in').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      );
    });

    // Section content animations
    document.querySelectorAll('.section').forEach((section, i) => {
      const content = section.querySelector('.section-content');
      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
          }
        );
      }
    });
  };

  const renderFeaturedCar = (vehicule: any) => {
    const photoUrl = vehicule?.photos?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80';
    const marque = vehicule?.marqueRef?.name || vehicule?.marque || 'Marque inconnue';
    const modele = vehicule?.model || vehicule?.modele || 'Modèle inconnu';
    const annee = vehicule?.year || vehicule?.annee || '';
    const categorie = vehicule?.categorie || 'SUV';
    const kilometrage = vehicule?.mileage || vehicule?.kilometrage;
    const prix = vehicule?.prix || vehicule?.prixJour || 0;
    const prixAchat = vehicule?.prixAchat || vehicule?.prix;
    const carburant = vehicule?.fuelType || vehicule?.carburant || 'Essence';
    const transmission = vehicule?.transmission || 'Automatique';
    const places = vehicule?.places || 5;

    return (
      <div className="car-card max-w-md mx-auto">
        <div className="car-image-container relative h-64 overflow-hidden rounded-lg">
          <img src={photoUrl} alt={`${marque} ${modele}`} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-semibold">
            POPULAIRE
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xl font-bold">{marque} {modele} {annee}</h4>
              <p className="text-gray-600">{categorie} • {kilometrage ? kilometrage.toLocaleString() + ' km' : 'Neuf'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">€{prix}<span className="text-gray-500 text-lg">/jour</span></p>
              {prixAchat && <p className="text-sm text-gray-500">ou €{prixAchat.toLocaleString()}</p>}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faGasPump} className="text-gray-500" /> <span className="text-gray-700">{carburant}</span></span>
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCogs} className="text-gray-500" /> <span className="text-gray-700">{transmission}</span></span>
              <span className="flex items-center gap-2"><FontAwesomeIcon icon={faUsers} className="text-gray-500" /> <span className="text-gray-700">{places}</span></span>
            </div>
            <button onClick={() => handleReserve(vehicule.id)} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors font-medium">
              Réserver
            </button>
          </div>
        </div>
      </div>
    );
  };

const VehicleCard = ({ vehicule }: { vehicule: any }) => {
  const photoUrl = vehicule?.photos?.[0] || 
                   'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80';
  
  const marque = vehicule?.marqueRef?.name || 'Marque inconnue';
  const modele = vehicule?.model || 'Modèle inconnu';
  const annee = vehicule?.year || '';
  const kilometrage = vehicule?.mileage || 0;
  const prix = vehicule?.prix || 0;
  const carburant = vehicule?.fuelType || 'Essence';
  const transmission = vehicule?.transmission || 'Automatique';
  const places = vehicule?.places || 5;

  const type = vehicule?.forSale && !vehicule?.forRent ? 'ACHAT' :
               vehicule?.forRent && !vehicule?.forSale ? 'LOCATION' : 'LES_DEUX';
  
  const disponible = vehicule?.status === 'DISPONIBLE';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all duration-300">
      {/* Image container - version simplifiée sans classe personnalisée */}
      <div className="h-48 w-full overflow-hidden relative">
        <img 
          src={photoUrl} 
          alt={`${marque} ${modele}`}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80';
          }}
        />
        {/* Badge disponibilité */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${disponible ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {disponible ? 'DISPONIBLE' : 'INDISPONIBLE'}
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-5">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {marque} {modele} {annee ? `(${annee})` : ''}
            </h3>
            <p className="text-sm text-gray-500">
              {kilometrage ? `${kilometrage.toLocaleString()} km` : 'Neuf'}
            </p>
          </div>
          
          <span className={`px-2 py-1 text-xs font-semibold rounded ${
            type === 'ACHAT' ? 'bg-blue-100 text-blue-800' : 
            type === 'LOCATION' ? 'bg-orange-100 text-orange-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {type === 'ACHAT' ? 'ACHAT' : type === 'LOCATION' ? 'LOCATION' : 'LES DEUX'}
          </span>
        </div>
        
        {/* Caractéristiques */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faGasPump} className="w-4 h-4" />
            <span>{carburant}</span>
          </div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faCogs} className="w-4 h-4" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
            <span>{places} places</span>
          </div>
        </div>
        
        {/* Prix et boutons */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xl font-bold text-orange-600">
              {prix.toLocaleString()}€
              {vehicule?.forRent && <span className="text-sm font-normal text-gray-500 ml-1">/jour</span>}
            </div>
            {vehicule?.prixAchat && vehicule?.forSale && (
              <div className="text-xs text-gray-500">
                Achat: {vehicule.prixAchat.toLocaleString()}€
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleReserve(vehicule.id)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {type === 'ACHAT' ? 'Acheter' : 'Réserver'}
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  // Sections data
  const howItWorksSteps = [
    { icon: faSearch, title: "1. Explorez", description: "Parcourez notre large sélection de véhicules. Filtrez par marque, modèle, prix ou type de carburant." },
    { icon: faCar, title: "2. Choisissez", description: "Sélectionnez la voiture qui vous convient. Achetez ou louez en fonction de vos besoins." },
    { icon: faCalendarCheck, title: "3. Réservez", description: "Choisissez vos dates et effectuez le paiement en toute sécurité via notre plateforme." },
    { icon: faRoad, title: "4. Profitez", description: "Récupérez votre véhicule au parking partenaire et profitez de votre trajet en toute sérénité." }
  ];

  const features = [
    { icon: faFilter, title: "Recherche avancée", description: "Trouvez le véhicule parfait grâce à nos filtres précis : marque, modèle, prix, carburant, transmission, et plus encore." },
    { icon: faFileContract, title: "Documents vérifiés", description: "Tous nos véhicules ont leurs documents à jour : assurance, carte grise, vignette et contrôle technique." },
    { icon: faShieldAlt, title: "Paiement sécurisé", description: "Transactions 100% sécurisées avec cryptage bancaire. Votre argent est protégé jusqu'à la livraison." },
    { icon: faStar, title: "Garantie incluse", description: "De nombreux véhicules bénéficient d'une garantie supplémentaire pour votre tranquillité d'esprit." }
  ];

  const testimonials = [
    { initial: "S", name: "Sophie Martin", role: "Client depuis 2022", text: "J'ai loué un Toyota RAV4 pour le week-end. L'expérience était incroyablement simple, du choix du véhicule à la récupération au parking partenaire.", rating: 5 },
    { initial: "P", name: "Parking Central", role: "Partenaire depuis 2021", text: "Grâce à Mobility, nous avons augmenté notre taux d'occupation de 40%. La gestion de notre flotte n'a jamais été aussi simple.", rating: 4.5 },
    { initial: "A", name: "Alexandre Dubois", role: "Client depuis 2023", text: "J'ai acheté mon premier SUV via Mobility. Le processus était transparent et l'accompagnement exceptionnel. Je recommande vivement !", rating: 5 }
  ];

  const ctaFeatures = [
    { icon: faCheckCircle, title: "Sans engagement", description: "Annulation gratuite jusqu'à 24h avant" },
    { icon: faLock, title: "Paiement sécurisé", description: "Cryptage bancaire de niveau militaire" },
    { icon: faHeadset, title: "Support 24/7", description: "Assistance client en continu" }
  ];

  return (
    <>
      <Head>
        <title>Mobility - Réservez votre voiture en toute liberté</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx global>{`
          :root {
            --primary: #FD6A00;
            --primary-light: #FF8C42;
            --primary-dark: #E55A00;
            --white: #FFFFFF;
            --light-bg: #F8F9FA;
            --dark-text: #1A1A1A;
            --gray: #6C757D;
            --light-gray: #E9ECEF;
          }
          
          html, body {
            background-color: #FFFFFF !important;
            color: #1A1A1A !important;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            scroll-behavior: smooth;
          }
          
          .gradient-text {
            color: #FD6A00;
          }
          
          .btn-orange {
            background: #FD6A00;
            color: white;
            transition: all 0.3s ease;
          }
          
          .btn-orange:hover {
            background: #E55A00;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(253, 106, 0, 0.2);
          }
          
          .car-card {
            background: white;
            border-radius: 20px;
            border: 1px solid #E9ECEF;
            transition: all 0.4s ease;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          
          .car-card:hover {
            transform: translateY(-10px);
            border-color: #FF8C42;
            box-shadow: 0 20px 40px rgba(253, 106, 0, 0.15);
          }
          
          .car-image-container {
            height: 200px;
            width: 100%;
            overflow: hidden;
            position: relative;
            border-radius: 15px 15px 0 0;
          }
          
          @media (max-width: 768px) {
            .car-image-container {
              height: 160px;
            }
          }
          
          .feature-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(253, 106, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FD6A00;
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .stat-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            border: 1px solid #E9ECEF;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
          }
          
          .section {
            min-height: 100vh;
            width: 100%;
            padding: 6rem 2rem;
            position: relative;
            display: flex;
            align-items: center;
            overflow: hidden;
          }
          
          .section-content {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            z-index: 10;
            position: relative;
          }
          
          .section-title {
            font-size: 2.5rem;
          }
          
          @media (min-width: 768px) {
            .section-title {
              font-size: 3.5rem;
            }
          }
          
          @media (min-width: 1024px) {
            .section-title {
              font-size: 4.5rem;
            }
          }
          
          .floating-element {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            filter: blur(40px);
            z-index: 0;
          }
          
          .morph-shape {
            position: absolute;
            z-index: 0;
            transition: all 1.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          }
          
          .car-animation {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .loading {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 3px solid rgba(253, 106, 0, 0.3);
            border-radius: 50%;
            border-top-color: #FD6A00;
            animation: spin 1s ease-in-out infinite;
          }
          
          .bg-light {
            background-color: #F8F9FA;
          }
          
          .nav-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: rgba(253, 106, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .nav-dot.active {
            background-color: #FD6A00;
            transform: scale(1.3);
            box-shadow: 0 0 10px rgba(253, 106, 0, 0.5);
          }
          
          .nav-dot:hover {
            background-color: #FD6A00;
            transform: scale(1.2);
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(253, 106, 0, 0.05);
          }
          
          ::-webkit-scrollbar-thumb {
            background: #FD6A00;
            border-radius: 4px;
          }
          
          /* Animation classes */
          .fade-in {
            opacity: 0;
            transform: translateY(30px);
          }
          
          .fade-in.active {
            opacity: 1;
            transform: translateY(0);
          }
        `}</style>
      </Head>

      {/* Header */}
      <header className="fixed top-0 w-full z-1000 bg-white/95 backdrop-blur-md border-b border-gray-200 py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="logo">
            <img src="/images/logo.jpg" alt="Mobility Logo" className="h-12 w-auto" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Comment ça marche
            </a>
            <a href="#vehicles" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Véhicules
            </a>
            <a href="#features" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Fonctionnalités
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Avis
            </a>

            {!user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowAuthModal(true); setAuthTab('login'); }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={() => { setShowAuthModal(true); setAuthTab('register'); }}
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors"
                >
                  S&apos;inscrire
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">{user.name || 'Utilisateur'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-2xl" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium py-2">
                Comment ça marche
              </a>
              <a href="#vehicles" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium py-2">
                Véhicules
              </a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium py-2">
                Fonctionnalités
              </a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-orange-600 font-medium py-2">
                Avis
              </a>
              
              {!user ? (
                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={() => { setShowAuthModal(true); setAuthTab('login'); setIsMobileMenuOpen(false); }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setAuthTab('register'); setIsMobileMenuOpen(false); }}
                    className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors"
                  >
                    S&apos;inscrire
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">{user.name || 'Utilisateur'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3D Background */}
      <div id="three-container" ref={threeContainerRef} className="fixed inset-0 z-1 pointer-events-none" />

      {/* Navigation Dots */}
      <div className="hidden md:flex fixed right-8 top-1/2 transform -translate-y-1/2 z-100 flex-col gap-6">
        {['hero', 'how-it-works', 'vehicles', 'features', 'testimonials', 'cta'].map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className={`nav-dot ${activeSection === index ? 'active' : ''}`}
            aria-label={`Aller à la section ${section}`}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="loading"></div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 z-1002 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'info' ? 'bg-blue-500' : 'bg-gray-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1001 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Connexion / Inscription</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="flex border-b mb-6">
              <button
                className={`flex-1 py-3 font-medium ${
                  authTab === 'login' 
                    ? 'border-b-2 border-orange-600 text-orange-600' 
                    : 'text-gray-500'
                }`}
                onClick={() => setAuthTab('login')}
              >
                Connexion
              </button>
              <button
                className={`flex-1 py-3 font-medium ${
                  authTab === 'register' 
                    ? 'border-b-2 border-orange-600 text-orange-600' 
                    : 'text-gray-500'
                }`}
                onClick={() => setAuthTab('register')}
              >
                Inscription
              </button>
            </div>

            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Se connecter
                </button>
              </form>
            )}

            {authTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nom complet"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  name="role"
                  defaultValue={authRole}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="CLIENT">Client</option>
                  <option value="PARKING">Parking partenaire</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  S&apos;inscrire
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && reservationVehicule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1001 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowReservationModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">
              Réserver {reservationVehicule.marqueRef?.name || reservationVehicule.marque} {reservationVehicule.model || reservationVehicule.modele}
            </h3>
            
            <div className="mb-6">
              <img
                src={reservationVehicule.photos?.[0] || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80'}
                alt="Véhicule"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-orange-600">
                    €{reservationVehicule.prix || reservationVehicule.prixJour}
                    <span className="text-gray-500 text-lg">/jour</span>
                  </p>
                  <p className="text-gray-600">Frais inclus: Assurance, Entretien</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={(e) => submitReservation(e, reservationVehicule.id)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Dates de location</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" name="dateDebut" className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="date" name="dateFin" className="w-full p-3 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Options supplémentaires</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="options[]" value="assurance_complete" className="mr-2" />
                      <span>Assurance complète (+€15/jour)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="options[]" value="siège_bébé" className="mr-2" />
                      <span>Siège bébé (+€5/jour)</span>
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full mt-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                Confirmer la réservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="section bg-light">
        <div className="section-content">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="section-title font-bold mb-6 leading-tight text-5xl">
                <span className="gradient-text">Mobility</span><br />
                Votre liberté sur 4 roues
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Réservez, louez ou achetez la voiture qui vous correspond en quelques clics.
                Une expérience simple, fluide et sécurisée.
              </p>
              <div className="flex flex-wrap gap-4 mb-16">
                <button 
                  onClick={() => scrollToSection('vehicles')}
                  className="px-8 py-4 btn-orange font-semibold rounded-full text-lg"
                >
                  Explorer les véhicules
                </button>
                <button className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 text-lg">
                  <FontAwesomeIcon icon={faPlayCircle} className="mr-2" />
                  Voir la démo
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h3 className="text-3xl font-bold gradient-text">{stats?.totalVehicules ?? '500'}+</h3>
                  <p className="text-gray-600">Véhicules disponibles</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold gradient-text">{stats?.totalParkings ?? '50'}+</h3>
                  <p className="text-gray-600">Partenaires parking</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold gradient-text">24/7</h3>
                  <p className="text-gray-600">Support client</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 car-animation">
                {featuredCar ? renderFeaturedCar(featuredCar) : (
                  <div className="car-card max-w-md mx-auto">
                    <div className="car-image-container">
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="loading"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Morphing shape */}
              <div className="morph-shape w-96 h-96 bg-gradient-to-r from-orange-100 to-orange-50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="floating-element w-64 h-64 bg-orange-200 top-20 left-10"></div>
        <div className="floating-element w-96 h-96 bg-orange-100 bottom-20 right-10"></div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="section-content">
          <div className="text-center mb-16">
            <h2 className="section-title font-bold mb-6 text-5xl">
              Comment <span className="gradient-text">ça marche</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mobility simplifie la réservation, l'achat et la location de véhicules en 4 étapes simples.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="stat-card fade-in text-center">
                <div className="feature-icon mx-auto">
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col lg:flex-row items-center gap-8 p-8 bg-orange-50 rounded-2xl border border-orange-100 max-w-4xl mx-auto">
              <div className="text-left">
                <h4 className="font-bold text-2xl mb-2 text-gray-800">Pour les partenaires parking</h4>
                <p className="text-gray-600">Créez un compte, ajoutez vos véhicules et gérez vos réservations facilement.</p>
              </div>
              <button onClick={() => { setShowAuthModal(true); setAuthTab('register'); setAuthRole('PARKING'); }} className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors whitespace-nowrap">
                Devenir partenaire
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section id="vehicles" className="section bg-light">
        <div className="section-content">
          <div className="text-center mb-16">
            <h2 className="section-title font-bold mb-6 text-5xl">
              Notre <span className="gradient-text">sélection</span> de véhicules
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des voitures pour tous les goûts et tous les budgets, disponibles à l'achat ou à la location.
            </p>
          </div>

          {/* Filters */}
          <form onSubmit={applyFilters} className="mb-12">
            <div className="flex flex-wrap gap-4 justify-center">
              <select name="marque" className="p-3 border border-gray-300 rounded-lg bg-white">
                <option value="">Toutes les marques</option>
                {marques.map((marque) => (
                  <option key={marque.name} value={marque.name}>
                    {marque.name}
                  </option>
                ))}
              </select>
              <select name="categorie" className="p-3 border border-gray-300 rounded-lg bg-white">
                <option value="">Toutes catégories</option>
                <option value="SUV">SUV</option>
                <option value="BERLINE">Berline</option>
                <option value="COMPACTE">Compacte</option>
                <option value="PICKUP">Pick-up</option>
              </select>
              <select name="carburant" className="p-3 border border-gray-300 rounded-lg bg-white">
                <option value="">Tous carburants</option>
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRIDE">Hybride</option>
                <option value="ELECTRIQUE">Électrique</option>
              </select>
              <button type="submit" className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Filtrer
              </button>
            </div>
          </form>
          

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="loading mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des véhicules...</p>
              </div>
            ) : allVehicles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FontAwesomeIcon icon={faCar} className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun véhicule trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
              </div>
            ) : (
              allVehicles.map((vehicule) => (
                <VehicleCard key={vehicule.id} vehicule={vehicule} />
              ))
            )}
          </div>

          {/* Load More Button */}
          {allVehicles.length > 0 && allVehicles.length % 6 === 0 && !isLoading && (
            <div className="text-center mt-12">
              <button 
                onClick={loadMoreVehicles}
                className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors text-lg"
              >
                <FontAwesomeIcon icon={faCar} className="mr-2" />
                Charger plus de véhicules
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="section-content">
          <div className="text-center mb-16">
            <h2 className="section-title font-bold mb-6 text-5xl">
              Pourquoi choisir <span className="gradient-text">Mobility</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les avantages qui font de Mobility la plateforme de réservation préférée.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              {/* Feature car with animation */}
              <div className="relative">
                <div className="car-card p-1">
                  <div className="car-image-container rounded-xl">
                    <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80" alt="Volkswagen Golf" className="car-image w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Floating stats */}
                <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4.9/5</div>
                    <div className="text-gray-600 text-sm">Satisfaction</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">24h</div>
                    <div className="text-gray-600 text-sm">Support</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-6 fade-in">
                    <div className="feature-icon flex-shrink-0">
                      <FontAwesomeIcon icon={feature.icon} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="section bg-light">
        <div className="section-content">
          <div className="text-center mb-16">
            <h2 className="section-title font-bold mb-6 text-5xl">
              Ils nous <span className="gradient-text">font confiance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les expériences de nos utilisateurs et partenaires parking.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="car-card p-8 fade-in">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-300 flex items-center justify-center text-xl font-bold text-white mr-4">
                    {testimonial.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={i < Math.floor(testimonial.rating) ? faStar : 
                            i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0 ? faStarHalfAlt : faStarRegular} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="section">
        <div className="section-content">
          <div className="text-center">
            <h2 className="section-title font-bold mb-8 text-5xl">
              Prêt à <span className="gradient-text">rouler</span> avec nous ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Rejoignez des milliers d&apos;utilisateurs qui ont simplifié leur mobilité. Téléchargez l&apos;application ou inscrivez-vous dès maintenant.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button onClick={() => { setShowAuthModal(true); setAuthTab('register'); }} className="px-10 py-5 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-2 text-lg shadow-lg hover:shadow-xl hover:shadow-orange-200">
                S&apos;inscrire gratuitement
              </button>
              <button className="px-10 py-5 bg-white text-gray-800 font-semibold rounded-2xl border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-300 text-lg">
                <FontAwesomeIcon icon={faMobileAlt} className="mr-2" />
                Télécharger l&apos;app
              </button>
            </div>
            
            <div className="car-card p-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ctaFeatures.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="feature-icon mx-auto">
                      <FontAwesomeIcon icon={feature.icon} />
                    </div>
                    <h4 className="font-bold text-xl mb-2 text-gray-800">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="absolute bottom-8 left-0 right-0 text-center text-gray-500">
            <p className="mb-2">© 2023 Mobility. Tous droits réservés.</p>
            <p className="text-sm">Conçu pour redéfinir la mobilité urbaine.</p>
          </footer>
        </div>
      </section>
    </>
  );
};

export default Home;