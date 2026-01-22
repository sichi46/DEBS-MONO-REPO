import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    Shield,
    Wallet,
    TrendingUp,
    FileCheck,
    Phone,
    Mail,
    MapPin,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function LandingPage() {
    const navigate = useNavigate();

    const onNavigate = (path: string) => {
        // Handle 'login' and 'register' paths specifically if needed, or just navigate
        if (path === 'login') navigate('/login');
        else if (path === 'register') navigate('/register');
        else navigate(path);
    };

    const features = [
        {
            icon: Shield,
            title: "Comprehensive Policy Management",
            description:
                "Manage all your insurance policies in one secure place. Track coverage, premiums, and renewal dates with ease.",
        },
        {
            icon: Wallet,
            title: "Seamless Payment Processing",
            description:
                "Pay your premiums securely online with multiple payment options. Set up auto-pay and never miss a payment.",
        },
        {
            icon: FileCheck,
            title: "Quick Claims Processing",
            description:
                "Submit and track claims digitally. Get real-time updates on your claim status and faster payouts.",
        },
        {
            icon: TrendingUp,
            title: "Investment Tracking",
            description:
                "Monitor your investment-linked policies and watch your wealth grow. Access detailed performance reports anytime.",
        },
    ];

    const articles = [
        {
            title: "Understanding Life Insurance in Zambia",
            excerpt:
                "Learn about the different types of life insurance and how to choose the right coverage for your family.",
            date: "Oct 15, 2025",
        },
        {
            title: "Planning for Your Financial Future",
            excerpt:
                "Discover key strategies for building long-term wealth and securing your family's financial independence.",
            date: "Oct 10, 2025",
        },
        {
            title: "How to File an Insurance Claim",
            excerpt:
                "A step-by-step guide to filing claims quickly and efficiently to get the support you need when you need it.",
            date: "Oct 5, 2025",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            {/* Header */}
            <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0057B7] rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl text-[#0057B7]">Debs Insurance</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-[#64748B] hover:text-[#0057B7] transition-colors">
                                Features
                            </a>
                            <a href="#about" className="text-[#64748B] hover:text-[#0057B7] transition-colors">
                                About
                            </a>
                            <a href="#education" className="text-[#64748B] hover:text-[#0057B7] transition-colors">
                                Resources
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => onNavigate("login")}
                            >
                                Login
                            </Button>
                            <Button onClick={() => onNavigate("register")}>
                                Sign Up
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0057B7] to-[#003d82] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-5xl leading-tight">
                                Secure Your Future, Simply.
                            </h1>
                            <p className="text-xl text-blue-100">
                                The modern, transparent way to manage your insurance and
                                investments in Zambia.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    onClick={() => onNavigate("register")}
                                    className="bg-white text-[#0057B7] hover:bg-gray-100"
                                >
                                    Get Started
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10"
                                >
                                    Learn More
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1609843502380-e39ddeaff979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZmFtaWx5JTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYwODMxMjE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Happy family"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Debs Section */}
            <section id="about" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1747114936280-257b662bfe72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN1cmFuY2UlMjBwcm90ZWN0aW9ufGVufDF8fHx8MTc2MDgzMTIxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Insurance and protection"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl text-[#1A202C]">What is Debs?</h2>
                            <p className="text-lg text-[#64748B] leading-relaxed">
                                Debs Insurance is Zambia's modern insurance and investment
                                platform, designed to bring transparency, accessibility, and
                                peace of mind to every Zambian family.
                            </p>
                            <p className="text-lg text-[#64748B] leading-relaxed">
                                We combine traditional insurance values with cutting-edge
                                technology to help you protect what matters most and build
                                lasting wealth for your family's future.
                            </p>
                            <p className="text-lg text-[#64748B] leading-relaxed">
                                Whether you're looking for life insurance, managing existing
                                policies, or exploring investment opportunities, Debs makes it
                                simple, secure, and transparent.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl text-[#1A202C] mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-[#64748B]">
                            Powerful features to manage your insurance and investments
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="border-[#E2E8F0] hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-[#E8F1FA] rounded-lg flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-[#0057B7]" />
                                        </div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-[#64748B]">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Educational Preview Section */}
            <section id="education" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl text-[#1A202C] mb-4">
                            Knowledge Hub
                        </h2>
                        <p className="text-xl text-[#64748B]">
                            Learn more about insurance and financial planning
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {articles.map((article, index) => (
                            <Card key={index} className="border-[#E2E8F0] hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="text-sm text-[#0057B7] mb-2">
                                        {article.date}
                                    </div>
                                    <CardTitle className="text-lg">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#64748B] mb-4">{article.excerpt}</p>
                                    <Button variant="link" className="p-0 h-auto text-[#0057B7]">
                                        Read More →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 bg-[#0057B7] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl mb-6">Ready to Take Control?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of Zambians who trust Debs Insurance for their
                        financial security and peace of mind.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => onNavigate("register")}
                        className="bg-white text-[#0057B7] hover:bg-gray-100"
                    >
                        Create Your Free Account
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1A202C] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#0057B7] rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl">Debs Insurance</span>
                            </div>
                            <p className="text-gray-400">
                                Securing your future with transparent, modern insurance
                                solutions.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Press
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4">Resources</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>+260 123 456 789</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>hello@debsinsurance.zm</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>Lusaka, Zambia</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                        <p>© 2025 Debs Insurance. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
