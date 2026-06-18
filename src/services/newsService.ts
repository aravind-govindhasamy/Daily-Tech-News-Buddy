import { NewsItem } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';

export interface FeedResource {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  isDefault: boolean;
}

export const DEFAULT_RESOURCES: FeedResource[] = [
  // General Tech
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'feed', description: 'Silicon Valley tech startup and venture capital news.', isDefault: true },
  { id: 'theverge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'feed', description: 'Tech, science, art, and culture reporting.', isDefault: true },
  { id: 'venturebeat', name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'feed', description: 'The leading source for tech news on transformative tech like AI.', isDefault: true },
  { id: 'arstechnica', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'feed', description: 'Deep tech news, reviews, and analysis.', isDefault: true },
  { id: 'wired', name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'feed', description: 'How technology is shaping our world and future.', isDefault: true },
  { id: 'engadget', name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'feed', description: 'Technology news, reviews, and guides.', isDefault: true },
  { id: 'devto', name: 'Dev.to', url: 'https://dev.to/feed', category: 'feed', description: 'A constructive and inclusive social network for software developers.', isDefault: true },
  { id: 'freecodecamp', name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/', category: 'feed', description: 'Excellent guides and tutorials on coding and dev skills.', isDefault: true },
  { id: 'infoq', name: 'InfoQ', url: 'https://feed.infoq.com/', category: 'feed', description: 'Software development trends, webinars, and news.', isDefault: true },
  { id: 'smashing', name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', category: 'feed', description: 'Articles and guide books on UX and web development.', isDefault: true },
  { id: 'rprogramming', name: 'Reddit Programming', url: 'https://www.reddit.com/r/programming/.rss', category: 'feed', description: 'Subreddit for professional programming community discussion.', isDefault: true },
  { id: 'githubblog', name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'feed', description: 'GitHub product updates, stories, and engineering news.', isDefault: true },
  { id: 'hnfrontpage', name: 'Hacker News Frontpage', url: 'https://hnrss.org/frontpage', category: 'feed', description: 'Intellectual articles curated on Hacker News frontpage.', isDefault: true },
  { id: 'readwrite', name: 'ReadWrite', url: 'https://readwrite.com/feed/', category: 'feed', description: 'Technology news with a focus on web and lifestyle.', isDefault: true },
  { id: 'zdnet', name: 'ZDNet', url: 'https://feeds.feedburner.com/zdnet/latest', category: 'feed', description: 'Business technology news and reviews.', isDefault: true },
  { id: 'techdirt', name: 'Techdirt', url: 'https://www.techdirt.com/feed/', category: 'feed', description: 'Insightful legal, technology and policy analysis.', isDefault: true },
  { id: 'gizmodo', name: 'Gizmodo', url: 'https://gizmodo.com/feed', category: 'feed', description: 'Technology, science fiction, and gadget news.', isDefault: true },
  { id: 'techradar', name: 'TechRadar', url: 'https://www.techradar.com/rss', category: 'feed', description: 'Technology news, reviews, and buying guides.', isDefault: true },
  { id: 'slashdot', name: 'Slashdot', url: 'https://slashdot.org/slashdot.rss', category: 'feed', description: 'News for nerds, stuff that matters.', isDefault: true },
  
  // Money
  { id: 'sidehustlenation', name: 'Side Hustle Nation', url: 'https://www.sidehustlenation.com/feed/', category: 'money', description: 'Actionable side hustles ideas and financial strategies.', isDefault: true },
  { id: 'thepennyhoarder', name: 'The Penny Hoarder', url: 'https://thepennyhoarder.com/feed/', category: 'money', description: 'Personal finance tips, budgeting, and savings.', isDefault: true },
  { id: 'makingsense', name: 'Making Sense of Cents', url: 'https://www.makingsenseofcents.com/feed', category: 'money', description: 'Earning passive income, blogging and life strategies.', isDefault: true },
  { id: 'smartpassiveintel', name: 'Smart Passive Income', url: 'https://www.smartpassiveincome.com/feed/', category: 'money', description: 'Pat Flynn\'s advice on starting and running online businesses.', isDefault: true },
  { id: 'sidehustleschool', name: 'Side Hustle School', url: 'https://sidehustleschool.com/feed/', category: 'money', description: 'Chris Guillebeau\'s daily case study about starting side projects.', isDefault: true },
  { id: 'nerdwallet', name: 'NerdWallet Blog', url: 'https://www.nerdwallet.com/blog/feed/', category: 'money', description: 'Expert advice, tools, and reviews on credit cards, banking, and loans.', isDefault: true },
  { id: 'mrmoneymustache', name: 'Mr. Money Mustache', url: 'https://www.mrmoneymustache.com/feed/', category: 'money', description: 'Financial freedom through badass frugality.', isDefault: true },
  { id: 'rsidehustle', name: 'Reddit Side Hustle', url: 'https://www.reddit.com/r/sidehustle/.rss', category: 'money', description: 'Community for brainstorming side income ideas.', isDefault: true },
  { id: 'rfrugal', name: 'Reddit Frugal', url: 'https://www.reddit.com/r/Frugal/.rss', category: 'money', description: 'Frugal living guides and community discussion.', isDefault: true },
  { id: 'rpersonalfinance', name: 'Reddit Personal Finance', url: 'https://www.reddit.com/r/personalfinance/.rss', category: 'money', description: 'Wealth accumulation, budget planning, retirement advice.', isDefault: true },
  { id: 'financialsamurai', name: 'Financial Samurai', url: 'https://www.financialsamurai.com/feed/', category: 'money', description: 'In-depth real estate, stock market, and career negotiation analyses.', isDefault: true },
  { id: 'financialtimes', name: 'Financial Times Personal Finance', url: 'https://www.ft.com/personal-finance?format=rss', category: 'money', description: 'Financial Times Personal Finance news and briefings.', isDefault: true },
  { id: 'investopedia', name: 'Investopedia', url: 'https://www.investopedia.com/feed', category: 'money', description: 'Personal finance tips, investment education, and definitions.', isDefault: true },
  { id: 'choosefi', name: 'ChooseFI', url: 'https://www.choosefi.com/feed/', category: 'money', description: 'Financial independence, retirement planning, and life optimization.', isDefault: true },

  // Cyber Crime
  { id: 'bleepingcomputer', name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', category: 'cyber', description: 'The absolute premier source for cybersecurity and malware reporting.', isDefault: true },
  { id: 'krebsonsecurity', name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', category: 'cyber', description: 'Brian Krebs\' exceptional investigations on computer crime.', isDefault: true },
  { id: 'thehackernews', name: 'The Hacker News', url: 'https://thehackernews.com/feeds/posts/default', category: 'cyber', description: 'Comprehensive cyber safety and hacking security coverage.', isDefault: true },
  { id: 'darkreading', name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', category: 'cyber', description: 'In-depth security analysis for enterprise tech professionals.', isDefault: true },
  { id: 'infosecurity', name: 'Infosecurity Magazine', url: 'https://www.infosecurity-magazine.com/rss/news/', category: 'cyber', description: 'Strategic cybersecurity wisdom, trends, and guidelines.', isDefault: true },
  { id: 'nakedsecurity', name: 'Naked Security by Sophos', url: 'https://nakedsecurity.sophos.com/feed/', category: 'cyber', description: 'Threat research, computer security warnings, and guides.', isDefault: true },
  { id: 'securityweek', name: 'SecurityWeek', url: 'https://www.securityweek.com/rss', category: 'cyber', description: 'Enterprise threat intelligence, reviews, and risk reports.', isDefault: true },
  { id: 'helpnetsec', name: 'Help Net Security', url: 'https://www.helpnetsec.com/feed/', category: 'cyber', description: 'Information security news, articles, and product announcements.', isDefault: true },
  { id: 'cisaalerts', name: 'CISA Cybersecurity Alerts', url: 'https://www.cisa.gov/cybersecurity-alerts/alerts.xml', category: 'cyber', description: 'Official cyber vulnerability and alert alerts from CISA.', isDefault: true },
  { id: 'fbicyber', name: 'FBI Cyber News', url: 'https://www.fbi.gov/feeds/cyber-news/rss.xml', category: 'cyber', description: 'Law enforcement reports on cyber espionage and criminals.', isDefault: true },
  { id: 'malwarebytesblog', name: 'CSO Online', url: 'https://www.reddit.com/r/cybersecurity/.rss', category: 'cyber', description: 'Security warnings and advice on online behavior.', isDefault: true },
  { id: 'schneier', name: 'Schneier on Security', url: 'https://www.schneier.com/feed/', category: 'cyber', description: 'Bruce Schneier’s world-famous security blog and commentary.', isDefault: true },
  { id: 'sans_isc', name: 'SANS Internet Storm Center', url: 'https://isc.sans.edu/rssfeed.xml', category: 'cyber', description: 'Daily cyber security briefings and intrusion analysis.', isDefault: true },
  { id: 'threatpost', name: 'Threatpost', url: 'https://threatpost.com/feed/', category: 'cyber', description: 'The first stop for IT security and vulnerability intelligence.', isDefault: true },

  // Deals & Giveaways
  { id: 'slickdeals', name: 'Slickdeals Frontpage', url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1', category: 'deals', description: 'Community-voted absolute best deals on the internet.', isDefault: true },
  { id: 'rfreebies', name: 'Reddit Freebies', url: 'https://www.reddit.com/r/freebies/.rss', category: 'deals', description: 'A database of totally free items on the web.', isDefault: true },
  { id: 'rcoupons', name: 'Reddit Coupons', url: 'https://www.reddit.com/r/coupons/.rss', category: 'deals', description: 'Coupon codes and discounts for online retailers.', isDefault: true },
  { id: 'rgiveaways', name: 'Reddit Giveaways', url: 'https://www.reddit.com/r/giveaways/.rss', category: 'deals', description: 'Active internet giveaways, sweepstakes, and raffles.', isDefault: true },
  { id: 'rdeals', name: 'Reddit Deals', url: 'https://www.reddit.com/r/deals/.rss', category: 'deals', description: 'Slashed prices and sales on technology and clothing.', isDefault: true },
  { id: 'techbargains', name: 'TechBargains', url: 'https://www.techbargains.com/rss', category: 'deals', description: 'Hand-picked tech deals, gadget offers, and coupons.', isDefault: true },

  // Hackathons & Comps
  { id: 'rhackathon', name: 'Reddit Hackathon', url: 'https://www.reddit.com/r/hackathon/.rss', category: 'competitions', description: 'Community posts about active and upcoming coding competitions.', isDefault: true },
  { id: 'rhackathons', name: 'Reddit Hackathons Feed', url: 'https://www.reddit.com/r/hackathons/.rss', category: 'competitions', description: 'Global hackathon discussions and recruitment posts.', isDefault: true },
  { id: 'rgamejams', name: 'Reddit Game Jams', url: 'https://www.reddit.com/r/gamejams/.rss', category: 'competitions', description: 'Subreddit feed tracking solo/indie game building sprint jams.', isDefault: true },
  { id: 'itchiojams', name: 'Itch.io Game Jams', url: 'https://itch.io/jams.xml', category: 'competitions', description: 'Official list of active and future indie game build contests.', isDefault: true },
  { id: 'rprogrammingcontests', name: 'Reddit Programming Contests', url: 'https://www.reddit.com/r/programmingcontests/.rss', category: 'competitions', description: 'Competitive programming challenges and contest directories.', isDefault: true },
  { id: 'ctftime', name: 'CTFTime Cyber Contests', url: 'https://ctftime.org/event/list/upcoming/rss/', category: 'competitions', description: 'Upcoming capture-the-flag hacker cybersecurity contest feed.', isDefault: true },

  // Govt Schemes
  { id: 'gtnnews', name: 'Tamil Nadu Gov Schemes', url: 'https://news.google.com/rss/search?q=intitle:scheme+OR+intitle:yojana+OR+intitle:subsidy+%22Tamil+Nadu%22+-election+-politics+-campaign&hl=en-IN&gl=IN&ceid=IN:en', category: 'schemes', description: 'Targeted search for official subsidies and social schemes in TN.', isDefault: true },
  { id: 'gindianews', name: 'India National Yojanae', url: 'https://news.google.com/rss/search?q=intitle:scheme+OR+intitle:yojana+OR+intitle:subsidy+%22India%22+-election+-politics+-campaign&hl=en-IN&gl=IN&ceid=IN:en', category: 'schemes', description: 'Central yojana and welfare scheme updates from Indian ministries.', isDefault: true },
  { id: 'gapplynews', name: 'Official Portals Apply Online', url: 'https://news.google.com/rss/search?q=%22apply+online%22+(scheme+OR+yojana+OR+subsidy)+India+-election+-politics&hl=en-IN&gl=IN&ceid=IN:en', category: 'schemes', description: 'Aggregated links for online application guidance portals.', isDefault: true },

  // IoT & Electronics
  { id: 'iotbusiness', name: 'Reddit IoT', url: 'https://www.reddit.com/r/iot/.rss', category: 'iot', description: 'Strategic business trends, connected modules and cellular IoT.', isDefault: true },
  { id: 'elemdesign', name: 'Reddit Hardware', url: 'https://www.reddit.com/r/hardware/.rss', category: 'iot', description: 'Hardware, microcontrollers, embedded engineering techniques.', isDefault: true },
  { id: 'embeddedfeed', name: 'Reddit Embedded', url: 'https://www.reddit.com/r/embedded/.rss', category: 'iot', description: 'Deep tech specifications on embedded code architectures.', isDefault: true },
  { id: 'arduinoblog', name: 'Reddit Arduino', url: 'https://www.reddit.com/r/arduino/.rss', category: 'iot', description: 'DIY electronics projects, single-board updates, open-hardware news.', isDefault: true },
  { id: 'hackaday', name: 'Reddit Electronics', url: 'https://www.reddit.com/r/electronics/.rss', category: 'iot', description: 'Exceptional modifications, hardware hacking, and electronic designs.', isDefault: true },
  { id: 'adafruitblog', name: 'Reddit Raspberry_Pi', url: 'https://www.reddit.com/r/raspberry_pi/.rss', category: 'iot', description: 'Makerspace news on physical computing and python on boards.', isDefault: true },

  // Startups
  { id: 'inc42', name: 'Reddit Startups', url: 'https://www.reddit.com/r/startups/.rss', category: 'startup', description: 'The premier news room for Indian startup innovations and tech investments.', isDefault: true },
  { id: 'yourstory', name: 'Reddit Entrepreneur', url: 'https://www.reddit.com/r/Entrepreneur/.rss', category: 'startup', description: 'Fabulous profiles of entrepreneurs and scaleups across India.', isDefault: true },
  { id: 'vccircle', name: 'VCCircle', url: 'https://www.vccircle.com/feed', category: 'startup', description: 'In-depth intelligence on private equity, funding, and M&As.', isDefault: true },
  { id: 'tcstartups', name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'startup', description: 'Global early stage venture stories and profiles.', isDefault: true },
  { id: 'eustartups', name: 'EU-Startups', url: 'https://www.eu-startups.com/feed/', category: 'startup', description: 'The leading tech startup magazine in Europe.', isDefault: true },
  { id: 'ycombinatorhn', name: 'Reddit YCombinator', url: 'https://www.reddit.com/r/ycombinator/.rss', category: 'startup', description: 'Discussions centered on Y Combinator cohorts.', isDefault: true },
  { id: 'startupgrind', name: 'Startup Grind', url: 'https://www.startupgrind.com/blog/feeds/rss/', category: 'startup', description: 'Startup education and lessons from scaling founders.', isDefault: true },
  { id: 'techeu', name: 'Tech.eu', url: 'https://tech.eu/feed/', category: 'startup', description: 'The premier source for European tech startup ecosystem news.', isDefault: true },
  { id: 'sifted', name: 'Sifted', url: 'https://sifted.eu/feed/', category: 'startup', description: 'Backed by FT, reporting on startup work culture and scaleup funds.', isDefault: true },

  // Open Source
  { id: 'ghopensource', name: 'GitHub Open Source Blog', url: 'https://github.blog/category/open-source/feed/', category: 'opensource', description: 'Stories of projects, developers and issues in security.', isDefault: true },
  { id: 'phoronix', name: 'Phoronix Feed', url: 'https://www.phoronix.com/rss.php', category: 'opensource', description: 'Hardware benchmarks, Linux kernel advancements, and graphics drivers.', isDefault: true },
  { id: 'itsfoss', name: 'Its FOSS', url: 'https://itsfoss.com/rss/', category: 'opensource', description: 'Linux guidance, tutorial publications, and modern app announcements.', isDefault: true },
  { id: 'hnopensource', name: 'Hacker News OSS', url: 'https://hnrss.org/newest?q=open+source', category: 'opensource', description: 'Trending open-source systems on Hacker News.', isDefault: true },
  { id: 'opensourcecom', name: 'Opensource.com', url: 'https://opensource.com/feed', category: 'opensource', description: 'How open source principles are applied in design, tech, and life.', isDefault: true },
  { id: 'linuxfoundation', name: 'Linux Foundation', url: 'https://www.linuxfoundation.org/feed', category: 'opensource', description: 'Official stories, project launches, and updates from LF.', isDefault: true },
  { id: 'linuxtoday', name: 'Linux Today', url: 'https://www.linuxtoday.com/feed/', category: 'opensource', description: 'Unified portal for Linux guides, open source applications, and reviews.', isDefault: true },

  // Business Open Source
  { id: 'gbizoss', name: 'Business Open Source News', url: 'https://news.google.com/rss/search?q=%22open+source%22+AND+(business+OR+enterprise)+software&hl=en-US&gl=US&ceid=US:en', category: 'business_oss', description: 'Trending news on open source solutions for enterprises.', isDefault: true },
  { id: 'gerpnext', name: 'Open Source ERP News', url: 'https://news.google.com/rss/search?q=%22open+source+ERP%22+OR+%22ERPNext%22+OR+%22Odoo%22&hl=en-US&gl=US&ceid=US:en', category: 'business_oss', description: 'Latest news about open source ERP software.', isDefault: true },
  { id: 'rselfhosted', name: 'Reddit Self-Hosted', url: 'https://www.reddit.com/r/selfhosted/.rss', category: 'business_oss', description: 'Discover popular self-hosted software alternatives for business.', isDefault: true },
  { id: 'redhat', name: 'Red Hat Blog', url: 'https://www.redhat.com/en/rss/blog', category: 'business_oss', description: 'Enterprise open source solutions, Linux, and hybrid cloud news.', isDefault: true },
  { id: 'ubuntu', name: 'Ubuntu Blog', url: 'https://ubuntu.com/blog/feed', category: 'business_oss', description: 'News on Ubuntu enterprise server, cloud computing, and security.', isDefault: true },
  { id: 'nextcloud', name: 'Nextcloud Blog', url: 'https://nextcloud.com/blog/feed/', category: 'business_oss', description: 'Updates on self-hosted enterprise productivity and collaboration platform.', isDefault: true },
  { id: 'rodoo', name: 'Reddit Odoo', url: 'https://www.reddit.com/r/Odoo/.rss', category: 'business_oss', description: 'Community discussions and news about Odoo ERP.', isDefault: true },
  { id: 'rerpnext', name: 'Reddit ERPNext', url: 'https://www.reddit.com/r/erpnext/.rss', category: 'business_oss', description: 'Community discussions and news about ERPNext.', isDefault: true },

  // AI in Enterprise
  { id: 'aiintelnews', name: 'Artificial Intelligence News', url: 'https://www.artificialintelligence-news.com/feed/', category: 'ai_enterprise', description: 'AI trends, commercial models, and corporate adoptions.', isDefault: true },
  { id: 'aibusiness', name: 'AI Business News', url: 'https://aibusiness.com/rss.xml', category: 'ai_enterprise', description: 'The primary tech journal for enterprise machine learning setups.', isDefault: true },
  { id: 'mittechreviewai', name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'ai_enterprise', description: 'Prestige MIT reporting on neural architecture and policies.', isDefault: true },
  { id: 'mitnewsai', name: 'MIT News AI Topic', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', category: 'ai_enterprise', description: 'Press feeds on machine learning, deep learning and robotics studies.', isDefault: true },
  { id: 'vbai', name: 'VentureBeat AI News', url: 'https://venturebeat.com/category/ai/feed/', category: 'ai_enterprise', description: 'AI foundation engineering and neural network model news.', isDefault: true },
  { id: 'marktechpost', name: 'MarkTechPost AI Studies', url: 'https://www.marktechpost.com/feed/', category: 'ai_enterprise', description: 'Academics papers summaries, open models, and training frameworks.', isDefault: true },
  { id: 'googleai', name: 'Google Keyword AI Blog', url: 'https://blog.google/technology/ai/rss/', category: 'ai_enterprise', description: 'DeepMind and Google Research innovations announcments.', isDefault: true },
  { id: 'openai', name: 'OpenAI discussions', url: 'https://hnrss.org/newest?q=openai', category: 'ai_enterprise', description: 'Recent news, reports, and discussions regarding OpenAI.', isDefault: true },
  { id: 'huggingface', name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'ai_enterprise', description: 'Open source models, transformers, and neural science logs.', isDefault: true },
  { id: 'openaiblog', name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'ai_enterprise', description: 'The official publication for news from OpenAI.', isDefault: true },
  { id: 'deepmind', name: 'Google DeepMind Blog', url: 'https://deepmind.google/blog/rss.xml', category: 'ai_enterprise', description: 'Google DeepMind’s latest research news and breakthroughs.', isDefault: true },
  { id: 'towardsdatascience', name: 'Towards Data Science', url: 'https://towardsdatascience.com/feed', category: 'ai_enterprise', description: 'User-driven ML tutorials, deep learning, and python libraries.', isDefault: true },
  { id: 'kdnuggets', name: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', category: 'ai_enterprise', description: 'Data science, analytics, AI, and machine learning articles.', isDefault: true },

  // Corporate & Career
  { id: 'rcareerguidance', name: 'Reddit Career Guidance', url: 'https://www.reddit.com/r/careerguidance/.rss', category: 'corporate', description: 'Job exploration, interviews guidance, and workplace advice.', isDefault: true },
  { id: 'rcscareers', name: 'Reddit CS Careers', url: 'https://www.reddit.com/r/cscareerquestions/.rss', category: 'corporate', description: 'Silicon Valley hire and tech career discussion.', isDefault: true },
  { id: 'rjobs', name: 'Reddit Jobs', url: 'https://www.reddit.com/r/jobs/.rss', category: 'corporate', description: 'General career tips, office strategies and interview listings.', isDefault: true },
  { id: 'rantiwork', name: 'Reddit Antiwork', url: 'https://www.reddit.com/r/antiwork/.rss', category: 'corporate', description: 'Labor politics and office balance discussion.', isDefault: true },
  { id: 'entrepreneur', name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'corporate', description: 'Leadership tips, remote operations, and managerial psychology.', isDefault: true },
  { id: 'askamanager', name: 'Ask a Manager', url: 'https://www.askamanager.org/feed', category: 'corporate', description: 'Alison Green\'s exceptional solutions to complicated workplace problems.', isDefault: true },
  { id: 'careercontessa', name: 'Career Contessa', url: 'https://feed.careercontessa.com/', category: 'corporate', description: 'Career resource for women, interview guide, salary negotiating tips.', isDefault: true },
  { id: 'cnbc_business', name: 'CNBC Business', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=12000000&id=10001147', category: 'corporate', description: 'Job exploration, company culture profiles, and career advice.', isDefault: true },

  // Dark Web
  { id: 'torblog', name: 'Tor Project official', url: 'https://blog.torproject.org/feed/', category: 'darkweb', description: 'Tor browser builds, cryptography guides and digital freedom.', isDefault: true },
  { id: 'rtor', name: 'Reddit Tor Developer', url: 'https://www.reddit.com/r/tor/.rss', category: 'darkweb', description: 'Onion services setup and browser configurations discussions.', isDefault: true },
  { id: 'rdarknet', name: 'Reddit Darknet', url: 'https://www.reddit.com/r/darknet/.rss', category: 'darkweb', description: 'Encryption, decentralized messaging, and privacy advocacy.', isDefault: true },

  // Community Interest Circles
  { id: 'mentalfloss_feed', name: 'Mental Floss', url: 'https://www.mentalfloss.com/feed', category: 'community_global_feed', description: 'Interesting global facts, history, science, and pop culture.', isDefault: true },
  { id: 'reddit_all_community', name: 'Reddit Social Web', url: 'https://www.reddit.com/r/all/.rss', category: 'community_global_feed', description: 'Aggregate public internet discussions and trending topics.', isDefault: true },
  
  { id: 'reddit_marvel', name: 'r/Marvel Feed', url: 'https://www.reddit.com/r/Marvel/.rss', category: 'community_marvel', description: 'Marvel Comics previews, character breakdowns, and fan discussions.', isDefault: true },
  { id: 'reddit_mcu', name: 'r/marvelstudios Feed', url: 'https://www.reddit.com/r/marvelstudios/.rss', category: 'community_marvel', description: 'Latest Marvel Cinematic Universe movies, secrets, and cast discussions.', isDefault: true },

  { id: 'adv_rider', name: 'Adventure Rider', url: 'https://www.adventurerider.com/feed/', category: 'community_riders', description: 'World riding reports, road tips, motorcycle tests, and gear reviews.', isDefault: true },
  { id: 'reddit_motorcycles', name: 'r/motorcycles Feed', url: 'https://www.reddit.com/r/motorcycles/.rss', category: 'community_riders', description: 'Biker community, route queries, safety discussions, and builds.', isDefault: true },

  { id: 'lonelyplanet', name: 'Lonely Planet News', url: 'https://www.lonelyplanet.com/news/backgrounder/feed', category: 'community_travel', description: 'Global travel guides, budget tips, hidden treasures, and itineraries.', isDefault: true },
  { id: 'reddit_travel', name: 'r/travel Feed', url: 'https://www.reddit.com/r/travel/.rss', category: 'community_travel', description: 'Wanderlust stories, packing queries, backpacking trip guide lines.', isDefault: true },

  { id: 'nonprofitpro', name: 'NonProfit PRO News', url: 'https://www.nonprofitpro.com/feed/', category: 'community_ngo', description: 'Management strategies, charity fundings, impact reports, and NGO campaigns.', isDefault: true },
  { id: 'reddit_charity', name: 'r/charity Feed', url: 'https://www.reddit.com/r/charity/.rss', category: 'community_ngo', description: 'Crowdfunding actions, altruism cases, global non-profit help.', isDefault: true },

  { id: 'americorps', name: 'AmeriCorps Updates', url: 'https://www.americorps.gov/rss.xml', category: 'community_volunteering', description: 'Official volunteering updates, deployment stories, disaster relief initiatives.', isDefault: true },
  { id: 'reddit_volunteer', name: 'r/volunteer Feed', url: 'https://www.reddit.com/r/volunteer/.rss', category: 'community_volunteering', description: 'Opportunities, mentoring, skills-based blood donation and community aid posts.', isDefault: true },

  { id: 'diyphotography', name: 'DIY Photography Hub', url: 'https://www.diyphotography.net/feed/', category: 'community_local', description: 'Action camera tips, photowalk tutorials, lighting hacks, local gear trends.', isDefault: true },
  { id: 'reddit_photography', name: 'r/photography Feed', url: 'https://www.reddit.com/r/photography/.rss', category: 'community_local', description: 'Photo critiques, neighborhood walks, gear setups, creative showcases.', isDefault: true }
];

// Helper to check which RSS urls are toggled in and fetch user-registered ones as well
export const getActiveFeedsForCategory = (categoryKey: string, defaultUrls: string[]): string[] => {
  let enabledMap: Record<string, boolean> = {};
  try {
    const saved = localStorage.getItem('techbuddy_sources_enabled');
    if (saved) enabledMap = JSON.parse(saved);
  } catch (e) {
    console.error('[newsService] Error parsing source configs:', e);
  }

  // Filter default urls
  const activeDefaults = defaultUrls.filter((url) => {
    const matchingDef = DEFAULT_RESOURCES.find(r => r.url === url);
    if (matchingDef && enabledMap[matchingDef.id] === false) {
      return false;
    }
    return true;
  });

  // Pull local custom feeds
  let customFeedsList: any[] = [];
  try {
    const savedCustom = localStorage.getItem('techbuddy_custom_feeds');
    if (savedCustom) customFeedsList = JSON.parse(savedCustom);
  } catch (e) {
    console.error('[newsService] Error parsing custom feeds:', e);
  }

  // Filter active custom feeds for this category key
  const activeCustoms = customFeedsList.filter(feed => {
    const belongs = feed.category === categoryKey;
    if (!belongs) return false;
    if (enabledMap[feed.feedId] === false) return false;
    return true;
  });

  const customUrls = activeCustoms.map(f => f.url);
  return [...activeDefaults, ...customUrls];
};

const getFallbackCategory = (url: string): string => {
  const u = url.toLowerCase();
  if (u.includes('github.blog')) return 'GitHub';
  if (u.includes('hnrss.org')) return 'Trending';
  if (u.includes('dev.to') || u.includes('freecodecamp') || u.includes('infoq') || u.includes('smashingmagazine') || u.includes('programming')) return 'Development';
  if (u.includes('readwrite')) return 'IoT';
  if (u.includes('sidehustle')) return 'Side Hustle';
  if (u.includes('frugal') || u.includes('pennyhoarder') || u.includes('mrmoneymustache')) return 'Save Money';
  if (u.includes('makingsenseofcents') || u.includes('smartpassiveincome') || u.includes('nerdwallet') || u.includes('personalfinance') || u.includes('financialsamurai')) return 'Money';
  if (u.includes('bleepingcomputer') || u.includes('krebsonsecurity') || u.includes('thehackernews') || u.includes('darkreading') || u.includes('infosecurity') || u.includes('nakedsecurity') || u.includes('securityweek') || u.includes('helpnetsecurity') || u.includes('cisa') || u.includes('fbi') || u.includes('malwarebytes')) return 'Cyber Crime';
  if (u.includes('freebies') || u.includes('giveaways')) return 'Giveaway';
  if (u.includes('coupons') || u.includes('slickdeals') || u.includes('deals') || u.includes('techbargains')) return 'Deal';
  if (u.includes('hackathon') || u.includes('programmingcontests') || u.includes('ctftime')) return 'Hackathon';
  if (u.includes('gamejams') || u.includes('itch.io')) return 'Game Jam';
  if (u.includes('google.com/rss/search?q=intitle:scheme') && u.includes('tamil+nadu')) return 'TN Govt Scheme';
  if (u.includes('google.com/rss/search?q=intitle:scheme') && u.includes('india')) return 'Indian Govt Scheme';
  if (u.includes('hackaday') || u.includes('iotworldtoday') || u.includes('staceyoniot') || u.includes('electronicsweekly') || u.includes('adafruit')) return 'IoT & Hardware';
  if (u.includes('techcrunch.com/category/startups') || u.includes('eu-startups') || u.includes('startupnews')) return 'Startup';
  if (u.includes('phoronix') || u.includes('itsfoss') || u.includes('q=open+source') || u.includes('opensource.com')) return 'Open Source';
  if (u.includes('selfhosted') || u.includes('frappe') || u.includes('erpnext') || u.includes('odoo') || u.includes('business+software') || u.includes('nextcloud') || u.includes('redhat') || u.includes('ubuntu')) return 'Business Open Source';
  if (u.includes('artificialintelligence-news') || u.includes('aibusiness') || u.includes('technologyreview.com/topic/artificial-intelligence') || u.includes('mit.edu/rss/topic/artificial-intelligence') || u.includes('venturebeat.com/category/ai') || u.includes('marktechpost') || u.includes('blog.google/technology/ai') || u.includes('techcrunch.com/category/artificial-intelligence') || u.includes('huggingface') || u.includes('openai')) return 'AI Enterprise';
  if (u.includes('careerguidance') || u.includes('cscareerquestions') || u.includes('jobs') || u.includes('antiwork') || u.includes('entrepreneur.com') || u.includes('cnbc.com') || u.includes('hiring') || u.includes('salary') || u.includes('increment') || u.includes('office') || u.includes('askamanager')) return 'Corporate Culture';
  if (u.includes('torproject') || u.includes('darknet') || u.includes('r/tor') || u.includes('onion') || u.includes('deep+web')) return 'Dark Web & Tor';
  if (u.includes('mentalfloss') || u.includes('r/all')) return 'Global Explorer';
  if (u.includes('cbr') || u.includes('marvel') || u.includes('mcu') || u.includes('avengers') || u.includes('spider-man')) return 'Marvel Universe';
  if (u.includes('motorcycles') || u.includes('adv_rider') || u.includes('adventurerider') || u.includes('biker') || u.includes('gear')) return 'Riders Hub';
  if (u.includes('lonelyplanet') || u.includes('r/travel') || u.includes('backpacking')) return 'Travel Corner';
  if (u.includes('nonprofitpro') || u.includes('r/charity') || u.includes('charity')) return 'Impact Fund';
  if (u.includes('americorps') || u.includes('r/volunteer') || u.includes('volunteer')) return 'Volunteering';
  if (u.includes('diyphotography') || u.includes('r/photography') || u.includes('photo')) return 'Local Squads';
  return 'Tech';
};

const autoTagCategory = (title: string, summary: string, rawCategory: string): string => {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();
  
  if (/\b(?:ai|artificial intelligence|machine learning|deep learning|llm|chatgpt|openai|neural network|genai|midjourney|anthropic|claude|gemini)\b/i.test(text)) {
    return 'AI';
  }
  
  if (/\b(?:cyber|security|hack|breach|vulnerability|malware|ransomware|phishing|infosec|cve)\b/i.test(text)) {
    return 'Security';
  }
  
  if (/\b(?:business|enterprise|startup|funding|acquisition|revenue|ipo|scaleup|founder|ceo|vc|b2b)\b/i.test(text)) {
    return 'Business';
  }

  // Fallback normalization logic
  if (rawCategory && typeof rawCategory === 'string') {
    const raw = rawCategory.toLowerCase();
    if (raw.includes('ai') || raw.includes('artificial')) return 'AI';
    if (raw.includes('cyber') || raw.includes('security')) return 'Security';
    if (raw.includes('startup') || raw.includes('business') || raw.includes('enterprise')) return 'Business';
    if (raw.includes('iot') || raw.includes('hardware')) return 'Hardware';
    if (raw.includes('open source') || raw.includes('oss')) return 'Open Source';
    if (raw === 'tech' || raw === 'trending') return 'Tech';
    return rawCategory;
  }
  
  return 'Tech';
};

const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 4500): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(id);
  }
};

const getStaticNewsFallback = (category: string): NewsItem[] => {
  const nowStr = new Date().toISOString();
  switch (category) {
    case 'top':
    case 'feed':
      return [
        {
          id: 'mock-top-1',
          title: 'React 19 Enters General Availability with Full Server Components Support',
          summary: 'The React team has officially released React 19, bringing stable Server Components, Actions API for form states, and the new resource loading hooks to production.',
          source: 'TechCrunch',
          url: 'https://techcrunch.com',
          publishedAt: nowStr,
          category: 'Development'
        },
        {
          id: 'mock-top-2',
          title: 'Next-Generation Solid State Batteries Reach 95% Charging Efficiency',
          summary: 'Researchers have demonstrated a new solid-state chemical matrix that overcomes mechanical degradation, paving the way for durable, high-throughput electric vehicle batteries.',
          source: 'The Verge',
          url: 'https://theverge.com',
          publishedAt: nowStr,
          category: 'Science'
        }
      ];
    case 'money':
      return [
        {
          id: 'mock-money-1',
          title: 'How to Build an Automated 3-Tier Passive Income Stream in 2026',
          summary: 'A step-by-step breakdown of leveraging automated micro-content hubs, high-yield dividend re-investment structures, and peer-to-peer computing hosting for passive yields.',
          source: 'Smart Passive Income',
          url: 'https://smartpassiveincome.com',
          publishedAt: nowStr,
          category: 'Passive Income'
        },
        {
          id: 'mock-money-2',
          title: 'High-Yield Savings Accounts Maintain 4.85% APY Amidst Interest Adjustments',
          summary: 'Leading digital fintech platforms continue to offer competitive yields for cash deposits, making treasury-backed cash reserves a solid anchor for personal portfolios.',
          source: 'NerdWallet',
          url: 'https://nerdwallet.com',
          publishedAt: nowStr,
          category: 'Savings'
        }
      ];
    case 'cyber':
      return [
        {
          id: 'mock-cyber-1',
          title: 'Critical Zero-Day Vulnerability Patched in Common Embedded Web Servers',
          summary: 'A remote code execution vulnerability affecting millions of IoT and smart meters has been patched. Security administrators are urged to apply firmware updates immediately.',
          source: 'BleepingComputer',
          url: 'https://bleepingcomputer.com',
          publishedAt: nowStr,
          category: 'Cyber Safety'
        },
        {
          id: 'mock-cyber-2',
          title: 'Sophisticated Ransomware Syndicate Disrupted in Global Joint Operation',
          summary: 'Law enforcement agencies from eight countries successfully seized command-and-control servers of a major threat group, retrieving thousands of decryption keys.',
          source: 'Krebs on Security',
          url: 'https://krebsonsecurity.com',
          publishedAt: nowStr,
          category: 'Cyber Security'
        }
      ];
    case 'deals':
      return [
        {
          id: 'mock-deals-1',
          title: 'Dual 27" 4K IPS Ergonomic Monitor Bundle (Lowest Price Ever)',
          summary: 'Get the absolute best workspace upgrade: two pro-caliber color-calibrated 4K screens with standard USB-C power delivery hubs for 45% off with code MON4K.',
          source: 'Slickdeals',
          url: 'https://slickdeals.net',
          publishedAt: nowStr,
          category: 'Workspace'
        }
      ];
    case 'competitions':
      return [
        {
          id: 'mock-comp-1',
          title: 'Global High-Throughput Generative AI Hackathon 2026',
          summary: 'Build real-world production architectures using Gemini models. Total prize pool of $50,000 for creations optimizing low-latency data and developer speed.',
          source: 'Reddit Programming',
          url: 'https://reddit.com/r/programming',
          publishedAt: nowStr,
          category: 'Hackathon'
        }
      ];
    case 'schemes':
      return [
        {
          id: 'mock-schemes-1',
          title: 'Tamil Nadu Digital Enterprise Startup Subsidy Scheme Live',
          summary: 'Registered tech startup offices focusing on IoT development, clean energies, and high-performance logistics can now apply online for a 20% capital subsidy.',
          source: 'TN Govt Portal',
          url: 'https://news.google.com',
          publishedAt: nowStr,
          category: 'TN Govt Scheme'
        }
      ];
    case 'iot':
      return [
        {
          id: 'mock-iot-1',
          title: 'Introducing the New Ultra-Low Power RISC-V Microcontrolled Dev Board',
          summary: 'Operating with less than 2µA in deep sleep mode and complete with on-board Bluetooth Low Energy, this compact board is designed for industrial sensing nodes.',
          source: 'Arduino Blog',
          url: 'https://blog.arduino.cc',
          publishedAt: nowStr,
          category: 'IoT & Hardware'
        }
      ];
    case 'startup':
      return [
        {
          id: 'mock-startup-1',
          title: 'Indian Robotics Startup Secures Series A Funding for Auto-Sorting Warehouses',
          summary: 'A Bangalore-based logistics robot company has raised $12M to deploy autonomous high-speed sorting drones to regional cargo terminals across South Asia.',
          source: 'Inc42',
          url: 'https://inc42.com',
          publishedAt: nowStr,
          category: 'Startup'
        }
      ];
    case 'opensource':
      return [
        {
          id: 'mock-oss-1',
          title: 'FastType: High-Speed Rust-based Terminal Document Editor Reaches 1.0',
          summary: 'Built purely in Rust with full async rendering, FastType supports LSP autocommpletions and consumes less than 5MB of memory, outperforming standard terminal utilities.',
          source: 'GitHub Open Source',
          url: 'https://github.blog',
          publishedAt: nowStr,
          category: 'Open Source'
        }
      ];
    case 'business_oss':
      return [
        {
          id: 'mock-bizoss-1',
          title: 'ERPNext 15 Released: Enhancing Warehouse Mobility and Offline Features',
          summary: 'The popular open source ERP system brings robust offline-first synchronization capabilities for mobile warehouse inventory management.',
          source: 'Open Source ERP News',
          url: 'https://frappe.io',
          publishedAt: nowStr,
          category: 'Business Open Source'
        }
      ];
    case 'ai_enterprise':
      return [
        {
          id: 'mock-ai-1',
          title: 'Google DeepMind Unveils Next-Gen low-latency Multimodal Speech Architecture',
          summary: 'A tiny, lightning-fast speech model that runs entirely on devices with human-like latency, enabling uninterrupted and natural offline voice assistants.',
          source: 'Google DeepMind',
          url: 'https://deepmind.google',
          publishedAt: nowStr,
          category: 'AI Enterprise'
        }
      ];
    case 'corporate':
      return [
        {
          id: 'mock-corp-1',
          title: 'The Shift Towards Task-Based Asynchronous Office Work Culture',
          summary: 'Leading software enterprises are replacing rigid live calendar sessions with structured asynchronous issue logs and voice-memo workflows to boost focused hours.',
          source: 'Entrepreneur',
          url: 'https://www.entrepreneur.com',
          publishedAt: nowStr,
          category: 'Corporate'
        }
      ];
    case 'darkweb':
      return [
        {
          id: 'mock-dark-1',
          title: 'Tor Browser 15.0 Released with Improved Fingerprinting Mitigations',
          summary: 'The development team at Tor has deployed experimental anti-canvas fingerprinting protocols to safeguard users against advanced tracking techniques.',
          source: 'Tor Project',
          url: 'https://blog.torproject.org',
          publishedAt: nowStr,
          category: 'Tor Security'
        }
      ];
    case 'community_global_feed':
      return [
        {
          id: 'mock-global-1',
          title: 'The Fascinating Origin Story of Ancient Floating Botanical Gardens',
          summary: 'An depth look at how Mesoamerican cultures engineered chinampas — highly productive self-watering agricultural rafts that fed entire regional capitals.',
          source: 'Mental Floss',
          url: 'https://www.mentalfloss.com',
          publishedAt: nowStr,
          category: 'Global Explorer'
        }
      ];
    case 'community_marvel':
      return [
        {
          id: 'mock-marvel-1',
          title: 'MCU Blade Film Secures New Creative Direction and Production Timeline',
          summary: 'Reports indicate Marvel Studios has curated a focused, gothic tone script aiming for mid-2027 releases, returning to high-contrast rated action styles.',
          source: 'ScreenRant MCU',
          url: 'https://screenrant.com',
          publishedAt: nowStr,
          category: 'Marvel Universe'
        }
      ];
    case 'community_riders':
      return [
        {
          id: 'mock-riders-1',
          title: 'Top Adventure Riding Routes Across the Majestic Rugged Ridges',
          summary: 'A compilation of the best high-traction dirt trails and scenic paved climbs for dual-sport motorcycles planning multi-day summer expeditions.',
          source: 'Adventure Rider',
          url: 'https://www.adventurerider.com',
          publishedAt: nowStr,
          category: 'Riders Hub'
        }
      ];
    case 'community_travel':
      return [
        {
          id: 'mock-travel-1',
          title: 'The Ultimate Checklist for Sustainable Budget Backpacking in 2026',
          summary: 'Expert guidelines on optimizing luggage weight, packing high-efficiency camping gear, and using decentralized transit passes for long continental trips.',
          source: 'Lonely Planet News',
          url: 'https://www.lonelyplanet.com',
          publishedAt: nowStr,
          category: 'Travel Corner'
        }
      ];
    case 'community_ngo':
      return [
        {
          id: 'mock-ngo-1',
          title: 'Global Altruism Index: Crowdfunded NGO Initiatives Record High Impact',
          summary: 'New report profiles how community-authorized mini-grants are accelerating clean water access and emergency relief modules at lower operation costs than traditional funds.',
          source: 'NonProfit PRO News',
          url: 'https://www.nonprofitpro.com',
          publishedAt: nowStr,
          category: 'Impact Fund'
        }
      ];
    case 'community_volunteering':
      return [
        {
          id: 'mock-volunteer-1',
          title: 'How Disaster Relief Volunteering Teams Deploy Swift Communications',
          summary: 'Highlighting how amateur radio operators and digital maps volunteers establish low-bandwidth coordination frameworks when telecom structures are offline.',
          source: 'AmeriCorps Updates',
          url: 'https://www.americorps.gov',
          publishedAt: nowStr,
          category: 'Volunteering'
        }
      ];
    case 'community_local':
      return [
        {
          id: 'mock-local-1',
          title: 'Optimizing Raw Exposure Settings for Nighttime Street Photography',
          summary: 'A step-by-step tutorial on balancing shutter speed, ISO limits, and wide-aperture lenses to capture sharp local cityscapes without relying on tripod stands.',
          source: 'DIY Photography Hub',
          url: 'https://www.diyphotography.net',
          publishedAt: nowStr,
          category: 'Local Squads'
        }
      ];
    default:
      return [
        {
          id: 'mock-default-1',
          title: 'Stay Prepared: Integrating Robust Fallback Models for Enterprise Apps',
          summary: 'How software architects safeguard mobile and web solutions against public endpoint dropouts and rate limits by deploying resilient local data structures.',
          source: 'Enterprise Tech',
          url: 'https://news.google.com',
          publishedAt: nowStr,
          category: 'Tech'
        }
      ];
  }
};

const fetchAndParseFeeds = async (feeds: string[]): Promise<NewsItem[]> => {
  if (!feeds || feeds.length === 0) return [];
  try {
    const fetchPromises = feeds.map(async (feedUrl) => {
      try {
        let jsonData = null;
        try {
          let rssDataUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
          const response = await fetchWithTimeout(rssDataUrl, {}, 4500);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
              jsonData = data;
            }
          }
        } catch (err) {
          console.warn(`rss2json fetch error for ${feedUrl}, proceeding to fallback...`, err);
        }

        // If rss2json succeeds
        if (jsonData) {
          return jsonData.items.map((item: any) => {
            const rawDescription = (item.description || '');
            const rawSummary = typeof rawDescription === 'string' ? rawDescription.replace(/<[^>]+>/g, '') : '';
            const shortSummary = rawSummary.substring(0, 200) + '...';
            const defaultCat = item.categories?.[0] || getFallbackCategory(feedUrl);
            
            return {
              id: item.guid || item.link,
              title: item.title,
              summary: shortSummary,
              source: item.author || jsonData.feed?.title || 'News Source',
              url: item.link,
              publishedAt: item.pubDate,
              category: autoTagCategory(item.title, rawSummary, defaultCat)
            };
          });
        }

        // Fallback: Use allorigins to get raw XML and parse it client-side
        console.warn(`rss2json failed for ${feedUrl}, falling back to allorigins XML parsing...`);
        let fallbackData: any = null;
        try {
          const fallbackRes = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`, {}, 4000);
          fallbackData = await fallbackRes.json();
        } catch (err) {
          console.warn(`allorigins failed for ${feedUrl}, trying corsproxy.io...`);
          try {
            const corsRes = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`, {}, 4000);
            const xmlText = await corsRes.text();
            fallbackData = { contents: xmlText };
          } catch (corsErr) {
            console.error(`All fallbacks failed for ${feedUrl}`);
          }
        }
        
        if (fallbackData && fallbackData.contents) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(fallbackData.contents, 'text/xml');
          
          // Check for ATOM feed vs RSS feed
          const isAtom = xml.documentElement.tagName.toLowerCase() === 'feed';
          
          if (isAtom) {
            const entries = Array.from(xml.querySelectorAll('entry')).slice(0, 15);
            return entries.map(entry => {
              const getTagText = (tag: string) => entry.querySelector(tag)?.textContent || '';
              const title = getTagText('title');
              const link = entry.querySelector('link')?.getAttribute('href') || getTagText('link');
              const pubDate = getTagText('published') || getTagText('updated');
              const summary = (getTagText('summary') || getTagText('content') || '');
              const plainSummary = summary.replace(/<[^>]+>/g, '');
              const shortSummary = plainSummary.substring(0, 200) + '...';
              
              return {
                id: getTagText('id') || link,
                title,
                summary: shortSummary,
                source: xml.querySelector('feed > title')?.textContent || 'News Source',
                url: link,
                publishedAt: pubDate || new Date().toISOString(),
                category: autoTagCategory(title, plainSummary, getFallbackCategory(feedUrl))
              };
            });
          } else {
            const items = Array.from(xml.querySelectorAll('item')).slice(0, 15);
            return items.map(item => {
              const getTagText = (tag: string) => item.querySelector(tag)?.textContent || '';
              const title = getTagText('title');
              const link = getTagText('link');
              const pubDate = getTagText('pubDate') || getTagText('dc:date');
              // Some feeds use <content:encoded> for full content, so check it if description is empty
              const encodedContent = item.getElementsByTagName('content:encoded');
              const description = (getTagText('description') || (encodedContent.length > 0 ? encodedContent[0].textContent : '') || '');
              const plainSummary = description.replace(/<[^>]+>/g, '');
              const shortSummary = plainSummary.substring(0, 200) + '...';
              
              return {
                id: getTagText('guid') || link,
                title,
                summary: shortSummary,
                source: xml.querySelector('channel > title')?.textContent || 'News Source',
                url: link,
                publishedAt: pubDate || new Date().toISOString(),
                category: autoTagCategory(title, plainSummary, getFallbackCategory(feedUrl))
              };
            });
          }
        }
        
        return [];
      } catch (e) {
        console.error(`Error fetching ${feedUrl}:`, e);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allNews = results.flat();
    
    // Sort by date descending
    return allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error('Error aggregating news:', error);
    return [];
  }
};

const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes limit for freshness

async function getCachedFeed(categoryId: string): Promise<NewsItem[] | null> {
  // Try Firestore first
  try {
    const docRef = doc(db, 'cachedFeeds', categoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedAt = new Date(data.updatedAt).getTime();
      const isFresh = Date.now() - updatedAt < CACHE_EXPIRY_MS;
      if (isFresh && data.items && data.items.length > 0) {
        console.log(`[Cache Hit - Firestore Fresh] categoryId: ${categoryId}`);
        return data.items as NewsItem[];
      }
      if (data.items && data.items.length > 0) {
        console.log(`[Cache Hit - Firestore Stale] categoryId: ${categoryId}`);
        return data.items as NewsItem[];
      }
    }
  } catch (error) {
    console.warn(`[Cache Error - Firestore Get] categoryId: ${categoryId}`, error);
  }

  // Fallback "else do something" (Local Storage cache)
  try {
    const localDataStr = localStorage.getItem(`cache_feed_${categoryId}`);
    if (localDataStr) {
      const localData = JSON.parse(localDataStr);
      const updatedAt = new Date(localData.updatedAt).getTime();
      const isFresh = Date.now() - updatedAt < CACHE_EXPIRY_MS;
      if (isFresh && localData.items && localData.items.length > 0) {
        console.log(`[Cache Hit - Local Fresh] categoryId: ${categoryId}`);
        return localData.items as NewsItem[];
      }
      if (localData.items && localData.items.length > 0) {
        console.log(`[Cache Hit - Local Stale] categoryId: ${categoryId}`);
        return localData.items as NewsItem[];
      }
    }
  } catch (localStorageError) {
    console.warn(`[Cache Error - Local Get] categoryId: ${categoryId}`, localStorageError);
  }

  return null;
}

async function getCachedOrStaticFallback(categoryId: string): Promise<NewsItem[]> {
  const cached = await getCachedFeed(categoryId);
  if (cached && cached.length > 0) {
    return cached;
  }
  return getStaticNewsFallback(categoryId);
}

async function saveCachedFeed(categoryId: string, items: NewsItem[]): Promise<void> {
  if (!items || items.length === 0) return;

  // Let's store up to 50 items so we keep the DB payload under size boundaries
  const trimmedItems = items.slice(0, 50);

  const cachePayload = {
    categoryId,
    updatedAt: new Date().toISOString(),
    items: trimmedItems
  };

  // Try saving in Firestore (if signed in, rules permit writing)
  if (auth.currentUser) {
    try {
      const docRef = doc(db, 'cachedFeeds', categoryId);
      await setDoc(docRef, cachePayload);
      console.log(`[Cache Saved - Firestore] categoryId: ${categoryId}`);
    } catch (error) {
      console.warn(`[Cache Error - Firestore Set] categoryId: ${categoryId}`, error);
    }
  } else {
    console.log(`[Cache - Skip Firestore Write (Not logged in)] categoryId: ${categoryId}`);
  }

  // Always save in localStorage as "else do something" fallback/offline cache
  try {
    localStorage.setItem(`cache_feed_${categoryId}`, JSON.stringify(cachePayload));
    console.log(`[Cache Saved - Local] categoryId: ${categoryId}`);
  } catch (localStorageError) {
    console.warn(`[Cache Error - Local Set] categoryId: ${categoryId}`, localStorageError);
  }
}

export const newsService = {
  // Methods to read/write custom registered feeds
  getCustomFeeds: async (): Promise<FeedResource[]> => {
    let localCustom: any[] = [];
    try {
      const saved = localStorage.getItem('techbuddy_custom_feeds');
      if (saved) localCustom = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    if (auth.currentUser) {
      try {
        const q = query(collection(db, 'customFeeds'), where('userId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        const fbCustom = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: d.feedId || doc.id,
            feedId: d.feedId || doc.id,
            name: d.name,
            url: d.url,
            category: d.category,
            description: 'Custom added channel resource.',
            isDefault: false
          };
        });

        localStorage.setItem('techbuddy_custom_feeds', JSON.stringify(fbCustom));
        return fbCustom;
      } catch (error) {
        console.warn('Firestore failed to load custom feeds, fallback to local cache:', error);
      }
    }

    return localCustom.map(f => ({
      id: f.feedId || f.id,
      feedId: f.feedId || f.id,
      name: f.name,
      url: f.url,
      category: f.category,
      description: 'Custom added channel resource.',
      isDefault: false
    }));
  },

  addCustomFeed: async (name: string, url: string, category: string): Promise<FeedResource> => {
    const feedId = crypto.randomUUID();
    const newFeed = {
      userId: auth.currentUser?.uid || 'offline',
      feedId,
      name,
      url,
      category,
      createdAt: new Date().toISOString()
    };

    let localCustom: any[] = [];
    try {
      const saved = localStorage.getItem('techbuddy_custom_feeds');
      if (saved) localCustom = JSON.parse(saved);
    } catch (e) {}
    localCustom.push(newFeed);
    localStorage.setItem('techbuddy_custom_feeds', JSON.stringify(localCustom));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'customFeeds', feedId), newFeed);
      } catch (error) {
        console.warn('Failed to save custom feed to Firestore:', error);
        handleFirestoreError(error, OperationType.WRITE, `customFeeds/${feedId}`);
      }
    }

    return {
      id: feedId,
      name,
      url,
      category,
      description: 'Custom added channel resource.',
      isDefault: false
    };
  },

  deleteCustomFeed: async (feedId: string): Promise<void> => {
    let localCustom: any[] = [];
    try {
      const saved = localStorage.getItem('techbuddy_custom_feeds');
      if (saved) localCustom = JSON.parse(saved);
    } catch (e) {}
    localCustom = localCustom.filter(f => f.feedId !== feedId && f.id !== feedId);
    localStorage.setItem('techbuddy_custom_feeds', JSON.stringify(localCustom));

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'customFeeds', feedId));
      } catch (error) {
        console.warn('Failed to delete custom feed from Firestore:', error);
        handleFirestoreError(error, OperationType.DELETE, `customFeeds/${feedId}`);
      }
    }
  },

  getTopNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('top');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'feed').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('feed', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('top', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('top');
  },

  getMoneyNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('money');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'money').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('money', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('money', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('money');
  },

  getCyberNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('cyber');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'cyber').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('cyber', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('cyber', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('cyber');
  },

  getDealsNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('deals');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'deals').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('deals', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('deals', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('deals');
  },

  getCompetitionNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('competitions');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'competitions').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('competitions', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('competitions', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('competitions');
  },

  getGovtSchemesNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('schemes');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'schemes').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('schemes', defaultUrls);
    const news = await fetchAndParseFeeds(resolvedUrls);
    const excludeWords = ['election', 'elections', 'polls', 'campaign', 'voting', 'mla', 'mp', 'political', 'politics'];
    const filtered = news.filter(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      return !excludeWords.some(word => new RegExp(`\\b${word}\\b`).test(text));
    });
    if (filtered && filtered.length > 0) {
      await saveCachedFeed('schemes', filtered);
      return filtered;
    }
    return getCachedOrStaticFallback('schemes');
  },

  getIotNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('iot');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'iot').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('iot', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('iot', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('iot');
  },

  getStartupNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('startup');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'startup').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('startup', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('startup', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('startup');
  },

  getBusinessOssNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('business_oss');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'business_oss').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('business_oss', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('business_oss', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('business_oss');
  },

  getOpenSourceNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('opensource');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'opensource').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('opensource', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('opensource', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('opensource');
  },

  getAiEnterpriseNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('ai_enterprise');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'ai_enterprise').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('ai_enterprise', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('ai_enterprise', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('ai_enterprise');
  },

  getCorporateNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('corporate');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'corporate').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('corporate', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('corporate', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('corporate');
  },

  getDarkWebNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('darkweb');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'darkweb').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('darkweb', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('darkweb', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('darkweb');
  },

  getGlobalCommunityNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_global_feed');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_global_feed').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_global_feed', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_global_feed', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_global_feed');
  },

  getMarvelNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_marvel');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_marvel').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_marvel', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_marvel', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_marvel');
  },

  getRidersNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_riders');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_riders').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_riders', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_riders', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_riders');
  },

  getTravelNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_travel');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_travel').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_travel', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_travel', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_travel');
  },

  getNgoNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_ngo');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_ngo').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_ngo', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_ngo', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_ngo');
  },

  getVolunteeringNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_volunteering');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_volunteering').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_volunteering', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_volunteering', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_volunteering');
  },

  getLocalSquadsNews: async (forceRefresh = false): Promise<NewsItem[]> => {
    if (!forceRefresh) {
      const cached = await getCachedFeed('community_local');
      if (cached) return cached;
    }
    const defaultUrls = DEFAULT_RESOURCES.filter(r => r.category === 'community_local').map(r => r.url);
    const resolvedUrls = getActiveFeedsForCategory('community_local', defaultUrls);
    const fresh = await fetchAndParseFeeds(resolvedUrls);
    if (fresh && fresh.length > 0) {
      await saveCachedFeed('community_local', fresh);
      return fresh;
    }
    return getCachedOrStaticFallback('community_local');
  }
};
