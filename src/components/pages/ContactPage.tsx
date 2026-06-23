import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AnimatedElement: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { 
        el.classList.add('opacity-100', 'translate-y-0'); 
        el.classList.remove('opacity-0', 'translate-y-8');
        observer.unobserve(el); 
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`${className || ''} opacity-0 translate-y-8 transition-all duration-700`}>{children}</div>;
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-paragraph">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <AnimatedElement>
              <div>
                <h2 className="text-3xl font-heading font-bold mb-6">Thông tin liên hệ</h2>
                <p className="text-muted-foreground font-paragraph text-lg mb-8 leading-relaxed">
                  Hãy liên hệ với chúng tôi qua các kênh dưới đây hoặc điền vào form bên cạnh. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold mb-1">Điện thoại</h3>
                      <a href="tel:0909999999" className="text-muted-foreground font-paragraph hover:text-primary transition-colors">
                        0909 999 999
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold mb-1">Email</h3>
                      <a href="mailto:cskh.webcake@gmail.com" className="text-muted-foreground font-paragraph hover:text-primary transition-colors break-all">
                        cskh.webcake@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold mb-1">Địa chỉ</h3>
                      <p className="text-muted-foreground font-paragraph">
                        Việt Nam
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
                  <h3 className="font-heading font-bold text-lg mb-4">Giờ làm việc</h3>
                  <div className="space-y-2 font-paragraph text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Thứ 2 - Thứ 6:</span>
                      <span className="font-semibold">8:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thứ 7:</span>
                      <span className="font-semibold">8:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chủ nhật:</span>
                      <span className="font-semibold">9:00 - 16:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            {/* Contact Form */}
            <AnimatedElement>
              <div className="bg-card p-8 rounded-3xl shadow-lg">
                <h2 className="text-2xl font-heading font-bold mb-6">Gửi tin nhắn</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-heading font-bold mb-2">
                      Họ và tên *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-heading font-bold mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-heading font-bold mb-2">
                      Số điện thoại
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="font-paragraph"
                      placeholder="0909 999 999"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-heading font-bold mb-2">
                      Tin nhắn *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="font-paragraph resize-none"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Đang gửi...'
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Gửi tin nhắn
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
