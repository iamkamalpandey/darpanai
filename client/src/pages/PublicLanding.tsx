import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  FileText, 
  GraduationCap, 
  Search,
  Users,
  Globe,
  Award,
  TrendingUp,
  Star,
  Play,
  Brain,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PublicLanding() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const heroStats = [
    { number: "27,000+", label: "Documents analyzed", icon: <FileText className="w-4 h-4" /> },
    { number: "96%", label: "Success rate", icon: <Award className="w-4 h-4" /> },
    { number: "50+", label: "Countries", icon: <Globe className="w-4 h-4" /> },
    { number: "2-5 min", label: "Analysis time", icon: <Clock className="w-4 h-4" /> }
  ];

  const services = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Visa Analysis",
      description: "Turn uncertainty into clarity with AI-powered visa document analysis",
      features: ["Success probability assessment", "Risk identification", "Strategic recommendations", "Next steps guidance"],
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "COE Analysis",
      description: "Navigate enrollment with confidence through comprehensive COE examination",
      features: ["Course verification", "Financial breakdown", "Compliance checking", "Timeline planning"],
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Offer Letter Analysis",
      description: "Make informed decisions with deep admission offer analysis",
      features: ["Scholarship matching", "Cost optimization", "Terms analysis", "Risk assessment"],
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Scholarship Research",
      description: "Discover funding opportunities with intelligent matching",
      features: ["5,000+ scholarships", "Smart matching", "Deadline tracking", "Success tips"],
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Master's Student, University of Melbourne",
      content: "Darpan Intelligence helped me understand my visa rejection and provided a clear path forward. I got approved on my second attempt.",
      rating: 5,
      country: "Singapore"
    },
    {
      name: "Raj Patel",
      role: "PhD Candidate, University of Toronto",
      content: "The scholarship matching feature found funding opportunities I never knew existed. Saved me thousands in tuition fees.",
      rating: 5,
      country: "India"
    },
    {
      name: "Maria Rodriguez",
      role: "Undergraduate, King's College London",
      content: "The COE analysis caught important details I missed. Helped me avoid costly mistakes before enrollment.",
      rating: 5,
      country: "Mexico"
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI maintains a 96% accuracy rate across all document types. We continuously train our models using verified outcomes and expert feedback to ensure reliable insights."
    },
    {
      question: "Which document types do you support?",
      answer: "We analyze visa documents (approvals/rejections), COE certificates, offer letters, and provide scholarship matching. Additional document types like SOPs and transcripts are coming soon."
    },
    {
      question: "How long does analysis take?",
      answer: "Most analyses complete within 2-5 minutes. Simple documents like COEs process faster, while comprehensive offer letter analysis with scholarship research takes slightly longer."
    },
    {
      question: "Is my document data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, don't store personal information longer than necessary, and never share your documents with third parties."
    },
    {
      question: "Do you provide consultation services?",
      answer: "Yes, we offer personalized consultation sessions with education experts. Our AI analysis helps identify key issues, and our consultants provide strategic guidance."
    }
  ];

  const benefits = [
    {
      title: "Save time",
      description: "Get insights in minutes, not weeks of research",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "Reduce risk",
      description: "Identify issues before they become problems",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Make confident decisions",
      description: "Data-driven recommendations you can trust",
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: "Find opportunities",
      description: "Discover scholarships and pathways you missed",
      icon: <Search className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Darpan Intelligence</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Success stories</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-8">
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Document Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Your education journey,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                decoded
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform uncertainty into opportunity. Get AI-powered insights on visa documents, 
              scholarships, and admissions in minutes, not months.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-lg px-8 py-6 rounded-xl">
                  Start free analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2">
                <Play className="w-5 h-5 mr-2" />
                Watch demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {heroStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-blue-600">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Intelligence for every document
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're analyzing visa decisions, understanding enrollment requirements, 
              or discovering funding opportunities—we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${service.gradient}`} />
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 text-gray-700 group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple. Fast. Accurate.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get professional-grade document analysis in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Securely upload your document—visa letters, COEs, offer letters, or any education-related document.",
                icon: <FileText className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "Analyze",
                description: "Our AI examines every detail, cross-references data, and identifies key insights you might miss.",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Act",
                description: "Get actionable recommendations, next steps, and strategic guidance to move forward confidently.",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why choose Darpan Intelligence?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Success stories
            </h2>
            <p className="text-xl text-gray-600">
              Real students. Real results. Real impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.country}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to decode your future?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of students who've transformed uncertainty into opportunity.
            Start your free analysis today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-xl bg-white text-gray-900 hover:bg-gray-100">
                Start free analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2 border-white text-white hover:bg-white hover:text-gray-900">
                Already have an account?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Darpan Intelligence</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Make informed education and career decisions with AI-powered document analysis.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Visa Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">COE Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Offer Letter Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scholarship Research</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book Consultation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Darpan Intelligence. All rights reserved. A product of Epitome Solutions ❤️
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}