import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

const supportEmail = 'reservation@vietpeacestay.vn';

const offices = [
    {
        id: 'ho-chi-minh',
        name: 'Trụ sở chính TP. Hồ Chí Minh',
        address: 'Tòa nhà VietPeace Stay Tower, 15 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        phone: '028 3822 9999',
        phoneHref: 'tel:+842838229999',
    },
    {
        id: 'ha-noi',
        name: 'Chi nhánh phía Bắc',
        address: '28 Phố Lý Thường Kiệt, Quận Hoàn Kiếm, TP. Hà Nội',
        phone: '024 3936 8888',
        phoneHref: 'tel:+842439368888',
    },
];

const contactPageStyles = `
    .vp-contact {
        --contact-ink: #233b53;
        --contact-muted: #526375;
        --contact-accent: #9a6414;
        --contact-border: #e9e0d2;
        background: #fff9ed;
        color: var(--contact-ink);
        padding-bottom: clamp(3rem, 7vw, 5.5rem);
    }

    .vp-contact * {
        box-sizing: border-box;
    }

    .vp-contact .vp-contact__container {
        width: min(68rem, calc(100% - 2.5rem));
        margin-inline: auto;
    }

    .vp-contact .vp-contact__hero {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: clamp(3.25rem, 8vw, 5.75rem) 0 5.25rem;
        background: linear-gradient(115deg, #172c44 12%, #284963 100%);
        color: #fff9ed;
    }

    .vp-contact .vp-contact__hero::after {
        content: '';
        position: absolute;
        z-index: -1;
        width: 32rem;
        height: 32rem;
        top: -14rem;
        right: -3rem;
        border: 1px solid rgb(245 184 46 / 30%);
        border-radius: 50%;
        box-shadow:
            0 0 0 2.75rem rgb(245 184 46 / 8%),
            0 0 0 5.5rem rgb(245 184 46 / 5%),
            0 0 0 8.25rem rgb(245 184 46 / 3%);
        pointer-events: none;
    }

    .vp-contact .vp-contact__hero h1 {
        max-width: 16ch;
        margin: 0;
        color: inherit;
        font-size: clamp(2.375rem, 6vw, 4.625rem);
        font-weight: 700;
        letter-spacing: -0.055em;
        line-height: 1.08;
        text-wrap: balance;
    }

    .vp-contact .vp-contact__hero p {
        max-width: 34rem;
        margin: 1rem 0 0;
        color: #e2e9ef;
        font-size: clamp(1rem, 2vw, 1.125rem);
        line-height: 1.65;
    }

    .vp-contact .vp-contact__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
    }

    .vp-contact .vp-contact__channels {
        position: relative;
        z-index: 1;
        margin-top: -2rem;
    }

    .vp-contact .vp-contact__channel,
    .vp-contact .vp-contact__office {
        min-width: 0;
        padding: clamp(1.125rem, 3vw, 1.75rem);
        border: 1px solid var(--contact-border);
        border-radius: 1.25rem;
        background: #fff;
    }

    .vp-contact .vp-contact__channel {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: clamp(0.625rem, 2vw, 1rem);
        box-shadow: 0 10px 26px rgb(35 59 83 / 8%);
        color: var(--contact-ink);
        text-decoration: none;
        transition: border-color 160ms ease, background-color 160ms ease;
    }

    .vp-contact .vp-contact__channel:hover {
        border-color: #d8af63;
        background: #fffcf5;
    }

    .vp-contact .vp-contact__icon {
        display: grid;
        place-items: center;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.875rem;
        background: #fff1cd;
        color: var(--contact-accent);
    }

    .vp-contact .vp-contact__label,
    .vp-contact .vp-contact__value {
        display: block;
    }

    .vp-contact .vp-contact__label {
        margin-bottom: 0.25rem;
        color: var(--contact-muted);
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .vp-contact .vp-contact__value {
        font-size: clamp(1rem, 2.2vw, 1.375rem);
        font-weight: 700;
        line-height: 1.3;
        overflow-wrap: anywhere;
    }

    .vp-contact .vp-contact__arrow {
        color: var(--contact-accent);
    }

    .vp-contact .vp-contact__offices {
        margin-top: clamp(2.5rem, 6vw, 4rem);
    }

    .vp-contact .vp-contact__offices h2 {
        margin: 0 0 1rem;
        color: inherit;
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.2;
    }

    .vp-contact .vp-contact__office {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .vp-contact .vp-contact__office .vp-contact__icon {
        flex: 0 0 auto;
    }

    .vp-contact .vp-contact__office h3 {
        margin: 0 0 0.5rem;
        color: inherit;
        font-size: 1.125rem;
        font-weight: 700;
        line-height: 1.35;
    }

    .vp-contact .vp-contact__office address {
        margin: 0;
        color: var(--contact-muted);
        font-size: 0.9375rem;
        font-style: normal;
        line-height: 1.6;
    }

    .vp-contact .vp-contact__office-phone {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 2.75rem;
        margin-top: 0.375rem;
        color: var(--contact-ink);
        font-weight: 700;
        text-decoration: none;
    }

    .vp-contact .vp-contact__office-phone:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
    }

    .vp-contact a:focus-visible {
        outline: 2px solid var(--contact-accent);
        outline-offset: 4px;
    }

    @media (max-width: 42rem) {
        .vp-contact .vp-contact__grid {
            grid-template-columns: minmax(0, 1fr);
        }

        .vp-contact .vp-contact__hero::after {
            right: -21rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .vp-contact .vp-contact__channel {
            transition: none;
        }
    }
`;

export default function ContactPage() {
    return (
        <div className="vp-contact">
            <style>{contactPageStyles}</style>

            <header className="vp-contact__hero">
                <div className="vp-contact__container">
                    <h1>Liên hệ VietPeace Stay</h1>
                    <p>Liên hệ với đội ngũ hỗ trợ nếu bạn cần tư vấn đặt phòng hoặc trợ giúp với đơn đặt phòng hiện tại.</p>
                </div>
            </header>

            <div className="vp-contact__container">
                <div className="vp-contact__grid vp-contact__channels">
                    <a className="vp-contact__channel" href="tel:19006868">
                        <span className="vp-contact__icon" aria-hidden="true">
                            <Phone size={21} />
                        </span>
                        <span>
                            <span className="vp-contact__label">Hotline hỗ trợ 24/7</span>
                            <span className="vp-contact__value">1900 6868</span>
                        </span>
                        <ArrowUpRight className="vp-contact__arrow" size={18} aria-hidden="true" />
                    </a>

                    <a className="vp-contact__channel" href={`mailto:${supportEmail}`}>
                        <span className="vp-contact__icon" aria-hidden="true">
                            <Mail size={21} />
                        </span>
                        <span>
                            <span className="vp-contact__label">Email đặt phòng</span>
                            <span className="vp-contact__value">{supportEmail}</span>
                        </span>
                        <ArrowUpRight className="vp-contact__arrow" size={18} aria-hidden="true" />
                    </a>
                </div>

                <section className="vp-contact__offices">
                    <h2>Văn phòng liên hệ</h2>
                    <div className="vp-contact__grid">
                        {offices.map((office) => (
                            <article className="vp-contact__office" key={office.id}>
                                <span className="vp-contact__icon" aria-hidden="true">
                                    <MapPin size={21} />
                                </span>
                                <div>
                                    <h3>{office.name}</h3>
                                    <address>{office.address}</address>
                                    <a className="vp-contact__office-phone" href={office.phoneHref}>
                                        <Phone size={16} aria-hidden="true" />
                                        {office.phone}
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
