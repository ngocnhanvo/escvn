import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Youtube } from 'lucide-react';
import { AppRouterProps, Pages } from '@/entities';
import { getContent, getTranslation } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { get } from 'react-hook-form';
import { handlePageLink } from './PageTransition';

export default function Footer(props: AppRouterProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const privacy = props.pages?.find((a: Pages) => a.key === 'privacy' && a.lang === language);
  const protectpolicy = props.pages?.find((a: Pages) => a.key === 'protectpolicy' && a.lang === language);
  const payment = props.pages?.find((a: Pages) => a.key === 'payment' && a.lang === language);
  const terms = props.pages?.find((a: Pages) => a.key === 'terms' && a.lang === language);
  const legaldocument = props.pages?.find((a: Pages) => a.key === 'legaldocument' && a.lang === language);

  return (
    <footer className="relative bg-surface-container-low pt-16 pb-8 overflow-hidden border-t border-border-subtle">
      {/* Decorative Background Layers (Overlay) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[80px] animate-blob" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[70px] animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-400/15 rounded-full blur-[60px] animate-blob animation-delay-4000" />

      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-border-subtle pb-12">
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.domains.title', language)}</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="">
                <a className="hover:text-signal-red transition-colors" href={getContent(props.pages, 'domainfree', language)}>
                  {getTranslation('footer.domains.free', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.domains.forms', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.domains.lifecycle', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.domains.process', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.domains.abuse', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.domains.new_provinces', language)}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4SgW02_4RefD2JCFAkRoWkwcOSFg_hcyxB6aZPighbGKQdO8Hm1_PUQr4zNg8Nj_sdjFc5xlyE9BT4Ll-uVGMTQWPUVJJ-nwluUrBwHFTbUOto025MFoBjv6YMuwzp3sGLAZW1hTyxO01C5brjpyu21RvZgtyxqR7K5MdH5M207EAQ5wPnzR0c0r97K44xa4kFoK0j2kvqqC8YtBJf_HGphAU-mLjK4ufubW0NCWtikZf39Q0yPW9iNaMuhdYXOB75qBQlyHAK8IpiaM"
                alt="VNNIC Certified"
                className="h-12 object-contain"
              />
              <div className="mt-4 flex items-center gap-4 text-on-surface-variant">
                <a href={props.data_info.facebook[language]} target="_blank" aria-label="Facebook" className="hover:text-signal-red hover:scale-110 transition-all duration-200">
                  <Facebook size={22} />
                </a>
                <a href={props.data_info.twitter[language]} target="_blank" aria-label="X (Twitter)" className="hover:text-signal-red hover:scale-110 transition-all duration-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/></svg>
                </a>
                <a href={props.data_info.tiktok[language]} target="_blank" aria-label="TikTok" className="hover:text-signal-red hover:scale-110 transition-all duration-200">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.53 1.13-.3 2.15-1.18 2.44-2.3.09-.3.1-.6.1-.91V.02z"/></svg>
                </a>
                <a href={props.data_info.youtube[language]} target="_blank" aria-label="YouTube" className="hover:text-signal-red hover:scale-110 transition-all duration-200">
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.email.title', language)}</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="">{getTranslation('footer.email.business_v2', language)}</li>
              <li className="">{getTranslation('footer.email.business_v3', language)}</li>
              <li className="">{getTranslation('footer.email.dedicated_server', language)}</li>
              <li className="">
                <br />
              </li>
              <li className="">
                <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.ssl.title', language)}</h4>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.ssl.security', language)}
                </a>
              </li>
              <li className="">{getTranslation('footer.ssl.sectigo', language)}</li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.ssl.geotrust', language)}
                </a>
              </li>
              <li className="">
                <br />
              </li>
              <li className="">
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="">
                    <h4 className="font-bold text-primary mb-6 uppercase">
                      {getTranslation('footer.web_design.title', language)}
                    </h4>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.hosting.title', language)}</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.hosting.cloud', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">{getTranslation('footer.hosting.cloud_v2', language)}</a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.hosting.wordpress', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.hosting.dedicated_ip', language)}
                </a>
              </li>
              <li className="">
                <br />
              </li>
              <li className="">
                <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.server.title', language)}</h4>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.server.vps', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.server.wp_management', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.server.colocation', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.server.dedicated', language)}
                </a>
              </li>
              <li className="" />
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-6 uppercase">{getTranslation('footer.support.title', language)}</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.support.recruitment', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.support.payment', language)}
                </a>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.support.knowledge_base', language)}
                </a>
              </li>
              <li className="">
                <br />
              </li>
              <li className="">
                <h4 className="font-bold text-primary mb-6 uppercase">
                  {getTranslation('footer.other_services.title', language)}
                </h4>
              </li>
              <li className="">
                <a className="hover:text-signal-red transition-colors" href="#">
                  {getTranslation('footer.other_services.plesk', language)}
                </a>
              </li>
              <li className="">
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="">
                    <a
                      className="hover:text-signal-red transition-colors"
                      href="https://app-companion-430619.appspot.com/projects/12733143981554144019?usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.lb.vi.jNwOADG1Nsk.O%2Fd%3D1%2Frs%3DAHpOoo_s8LJUD_uFbjY2X4aCRtCONneL2Q%2Fm%3D__features__#"
                    >
                      {getTranslation('footer.other_services.directadmin', language)}
                    </a>
                  </li>
                </ul>
              </li>
              <li className="">{getTranslation('footer.other_services.google_ads', language)}</li>
              <li className="">{getTranslation('footer.other_services.antivirus', language)}</li>
              <li className="mt-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0yXFhlzBPky7yp3TGdixbuR-K31AFIXZ9GNh3jWPdW8oGTo7hMPfAtJPJRtQgEVdBugD3NPDI3FV6YndQc3qjXElRSZ0nNMhZ14qi1nxUPUUmYNwtK7lb1nTeARPMa9HPI_V360tS954j2D8GoSt8DpetHOy47nDuJWyuazPqLVFE0VnSYXB5v0o65CLrP-Q7K8244LOyiz_aLoDlTIJeo-ALstWy7QXygrSs4aZUIGh9CYatq-bkbhJGadmZVBXcJ-4gFQr7hmHX"
                  alt="Positive SSL Trust Seal"
                  className="h-8 w-auto"
                />
              </li>
              <li className="mt-4 flex justify-start">
                <br />
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-on-surface-variant opacity-80">
            <Link 
              to={`/${privacy?.slug}`}
              onClick={(e) => {
                handlePageLink(e, `/${privacy?.slug}`, navigate);
              }}
              className="hover:text-signal-red transition-colors"
            >
              {privacy?.label}
            </Link>
            
            <span className="text-outline-variant">Ι</span>
            
            <Link 
              to={`/${protectpolicy?.slug}`}
              onClick={(e) => {
                handlePageLink(e, `/${protectpolicy?.slug}`, navigate);
              }}
              className="hover:text-signal-red transition-colors"
            >
              {protectpolicy?.label}
            </Link>

            <span className="text-outline-variant">Ι</span>
            
            <Link 
              to={`/${payment?.slug}`}
              onClick={(e) => {
                handlePageLink(e, `/${payment?.slug}`, navigate);
              }}
              className="hover:text-signal-red transition-colors"
            >
              {payment?.label}
            </Link>

            <span className="text-outline-variant">Ι</span>
            
            <Link 
              to={`/${terms?.slug}`}
              onClick={(e) => {
                handlePageLink(e, `/${terms?.slug}`, navigate);
              }}
              className="hover:text-signal-red transition-colors"
            >
              {terms?.label}
            </Link>
            
            <span className="text-outline-variant">Ι</span>

            <Link 
              to={`/${legaldocument?.slug}`}
              onClick={(e) => {
                handlePageLink(e, `/${legaldocument?.slug}`, navigate);
              }}
              className="hover:text-signal-red transition-colors"
            >
              {legaldocument?.label}
            </Link>
          </div>
          <p className="text-xs text-on-surface-variant opacity-60">
            {getTranslation('footer.domains.reserved', language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
