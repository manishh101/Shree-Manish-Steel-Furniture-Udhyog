const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local manually
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
    console.log('✅ Loaded env variables from .env.local');
  }
} catch (e) {
  console.error('Error reading .env.local file', e);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Define Schema matching models/Blog.ts
const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    image: { type: String, default: '' },
    author: { type: String, default: 'Shree Manish Steel Furniture' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    metaTitle: { type: String },
    metaDescription: { type: String },
    readTime: { type: Number, default: 5 },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Register or get model
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const blogsData = [
  {
    title: 'विराटनगरमा स्टील दराज (Steel Almirah) खरिद गर्दा ध्यान दिनुपर्ने कुराहरू र मूल्य सूची',
    slug: 'steel-almirah-buying-guide-price-biratnagar',
    excerpt: 'के तपाईं विराटनगरमा नयाँ स्टील दराज (Steel Daraj) किन्ने योजनामा ​​हुनुहुन्छ? गुणस्तरीय स्टील दराज कसरी छनोट गर्ने, गेज र साइज कसरी बुझ्ने, र मूल्य कति पर्छ भन्ने सम्पूर्ण जानकारी यहाँ पढ्नुहोस्।',
    image: '/images/furniture-1.jpg',
    readTime: 6,
    tags: ['स्टील दराज', 'Almirah Price Nepal', 'Biratnagar Steel Furniture', 'Home Wardrobe'],
    metaTitle: 'Steel Almirah Price in Biratnagar & Buying Guide Nepal',
    metaDescription: 'Looking for steel almirah in Biratnagar, Nepal? Read our ultimate buying guide covering steel gauge, lock security, and latest price lists in Biratnagar.',
    content: `
      <h2>विराटनगरमा गुणस्तरीय स्टील दराज कसरी छनोट गर्ने?</h2>
      <p>घरको सुरक्षा र कपडा तथा महत्वपूर्ण कागजातहरू सुरक्षित राख्नको लागि <strong>स्टील दराज (Steel Almirah / Daraj)</strong> सधैं पहिलो रोजाइमा पर्छ। तर बजारमा धेरै किसिमका तयारी दराजहरू पाइने हुनाले कुन गुणस्तरीय हो र कुन कमसल हो भनेर छुट्याउन गाह्रो हुन्छ। विराटनगर र यस आसपासका क्षेत्रमा स्टील दराज खरिद गर्दा ध्यान दिनुपर्ने केही मुख्य बुँदाहरू तल प्रस्तुत गरिएको छ:</p>
      
      <h3>१. स्टील पाताको मोटाई (Gauge/गेज)</h3>
      <p>दराजको स्थायित्व र मजबूती स्टीलको पाताको मोटाईमा भर पर्छ। फर्निचर निर्माणमा गेज (Gauge) जति सानो हुन्छ, स्टीलको पाता त्यति नै बाक्लो र बलियो हुन्छ:</p>
      <ul>
        <li><strong>२० गेज (20 Gauge):</strong> यो सबैभन्दा बलियो र भारी हुन्छ। ठूला दराज र तिजोरीका लागि यो उपयुक्त हुन्छ।</li>
        <li><strong>२२ गेज (22 Gauge):</strong> यो घरायसी प्रयोगका दराजहरूका लागि सबैभन्दा उत्तम र लोकप्रिय साइज हो।</li>
        <li><strong>२४ गेज (24 Gauge):</strong> यो हल्का र सस्तो हुन्छ। यदि बजेट कम छ भने यो विकल्प रोज्न सकिन्छ।</li>
      </ul>
      <p><em>श्री मनिष स्टील फर्निचर उद्योग</em> ले सधैं २० र २२ गेजको गुणस्तरीय स्टील पाता मात्र प्रयोग गरेर दराजहरू तयार गर्दछ।</p>

      <h3>२. रङ र फिनिसिङ (Powder Coating vs Paint)</h3>
      <p>तराईको ओसिलो मौसम (Humidity) मा फलाममा चाँडै खिया लाग्ने सम्भावना हुन्छ। त्यसैले <strong>पाउडर कोटेड (Powder Coated)</strong> फिनिसिङ भएको दराज रोज्नुपर्छ। पाउडर कोटिंगले दराजलाई खिया लाग्न दिँदैन र लामो समयसम्म यसको चमक कायम राख्छ। हामी हाम्रा सबै दराजहरूमा उच्चस्तरीय पाउडर कोटिंग र इनामेल पेन्ट गर्छौं।</p>

      <h3>३. लक र सुरक्षा संयन्त्र (Security Locks)</h3>
      <p>दराज खरिद गर्दा लकको गुणस्तर जाँच गर्न नबिर्सनुहोस्। आधुनिक दराजहरूमा डिजिटल लक, थ्री-वे लक, र बहु-कम्पार्टमेन्ट सेफ (Safe Locker) जडान गरिएका हुन्छन्।</p>

      <h3>४. विराटनगरमा स्टील दराजको अनुमानित मूल्य सूची (Estimated Steel Daraj Price in Biratnagar)</h3>
      <p>दराजको मूल्य यसको साइज, डिजाइन र पाताको मोटाई (Gauge) मा निर्भर हुन्छ। यहाँ विराटनगर स्थानीय बजारको सामान्य मूल्य दायरा दिइएको छ:</p>
      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>दराजको प्रकार (Type of Daraj)</th>
            <th>अनुमानित मूल्य दायरा (Biratnagar Price)</th>
            <th>मुख्य विशेषता</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>२ ढोके साधारण दराज (Double Door Standard)</td>
            <td>रु. १५,००० - रु. २५,०००</td>
            <td>घरायसी प्रयोग, सिम्पल लक</td>
          </tr>
          <tr>
            <td>३ ढोके प्रिमियम दराज (Triple Door Wardrobe)</td>
            <td>रु. २५,००० - रु. ४५,०००</td>
            <td>धेरै स्पेस, ड्रेसिङ ऐना सहित</td>
          </tr>
          <tr>
            <td>स्लाइडिङ ढोका भएको दराज (Sliding Door Almirah)</td>
            <td>रु. ३०,००० - रु. ५०,०००</td>
            <td>आधुनिक डिजाइन, कम ठाउँ ओगट्ने</td>
          </tr>
          <tr>
            <td>सेफ तिजोरी सहितको दराज (Locker Wardrobe)</td>
            <td>रु. २०,००० - रु. ३५,०००</td>
            <td>थप सुरक्षा, लकर र गोप्य दराज</td>
          </tr>
        </tbody>
      </table>

      <h3>५. हामीकहाँ किन आउने?</h3>
      <p>विराटनगर धरान रोडमा अवस्थित <strong>श्री मनिष स्टील फर्निचर उद्योग</strong> मा तपाईंको आवश्यकता अनुसार जुनसुकै आकार, रङ र डिजाइनमा दराज अर्डर गर्न सक्नुहुन्छ। हामी डिलर मार्फत नभई सिधै आफ्नै उद्योगबाट बिक्री गर्ने हुनाले विराटनगर बजारमा सबैभन्दा सस्तो मूल्यमा ग्यारेन्टी सहितको स्टील दराज उपलब्ध गराउँछौं। थप जानकारीका लागि हामीलाई <strong>9824336371</strong> मा सम्पर्क गर्नुहोस्।</p>
    `
  },
  {
    title: 'तराईको ओसिलो र तातो मौसममा किन काठ भन्दा स्टील फर्निचर उपयुक्त हुन्छ?',
    slug: 'why-steel-furniture-superior-wood-terai-climate',
    excerpt: 'तराईको ओस, ओसिलो हावा र गर्मीका कारण काठका फर्निचरहरू चाँडै बिग्रन्छन्। जान्नुहोस् किन विराटनगर, धरान र इटहरी जस्ता क्षेत्रहरूका लागि स्टील फर्निचर सबैभन्दा उपयुक्त र टिकाउ विकल्प हो।',
    image: '/images/furniture-2.jpg',
    readTime: 5,
    tags: ['स्टील फर्निचर', 'काठ र स्टील फर्निचर', 'Durable Furniture Nepal', 'Biratnagar local market'],
    metaTitle: 'Why Steel Furniture is Best for Terai Climate (Nepal)',
    metaDescription: 'Compare steel vs wooden furniture durability in Terai region (Biratnagar, Dharan, Itahari). Learn why steel almirahs and tables resist humidity and termites better.',
    content: `
      <h2>तराईको मौसम र फर्निचरको सुरक्षा</h2>
      <p>नेपालको तराई क्षेत्र, विशेष गरी विराटनगर, इटहरी र झापा जस्ता भूभागहरूमा गर्मी र ओस (Humidity) अत्यधिक हुन्छ। मनसुनको समयमा ओसको मात्रा निकै बढ्छ। यस्तो वातावरणमा काठका फर्निचरहरूमा विभिन्न समस्याहरू देखिन थाल्छन्। त्यसैले तराई क्षेत्रका घर र कार्यालयहरूमा हिजोआज स्टील फर्निचरको माग तीव्र रूपमा बढिरहेको छ।</p>

      <h3>काठका फर्निचरमा देखिने समस्याहरू:</h3>
      <ul>
        <li><strong>काठ फुल्ने र बाङ्गिने (Warping & Swelling):</strong> हावामा भएको पानीको मात्रा सोसेर काठका ढोका र घर्रा (Drawers) सजिलै खुल्दैनन् वा बन्द हुँदैनन्।</li>
        <li><strong>धमिरा र कीराको प्रकोप (Termite Attacks):</strong> ओसिलो काठ धमिराको मनपर्ने वासस्थान हो। लाखौं रुपैयाँ खर्चेर बनाएको सोफा वा दराज केही वर्षमै धमिराले खाएर नष्ट गर्छ।</li>
        <li><strong>ढुसी लाग्ने (Mold and Fungus Growth):</strong> ओसका कारण काठको सतहमा हरियो वा सेतो ढुसी लागेर गन्हाउने समस्या हुन्छ।</li>
      </ul>

      <h3>स्टील फर्निचरका फाइदाहरू:</h3>
      <ol>
        <li><strong>१००% धमिरा मुक्त (Termite Proof):</strong> स्टीलमा धमिरा वा कुनै पनि कीरा लाग्ने सम्भावना हुँदैन। यसले तपाईंको लगानीलाई सधैंका लागि सुरक्षित राख्छ।</li>
        <li><strong>ओस र पानी प्रतिरोधी (Moisture Resistant):</strong> स्टीलले पानी सोस्दैन। राम्रोसँग पाउडर कोटेड गरिएको स्टील दराज, खाट वा अफिस टेबलमा ओसको कुनै प्रभाव पर्दैन।</li>
        <li><strong>लामो आयु र बलियो (Durable & Strong):</strong> उच्च गुणस्तरको फलाम वा स्टीलबाट बनेका फर्निचरहरू धेरै वर्षसम्म जस्ताको त्यस्तै रहन्छन्।</li>
        <li><strong>सजिलो सरसफाइ र कम मर्मत (Low Maintenance):</strong> भिजेको कपडाले पुछेर सजिलै सफा गर्न सकिन्छ। काठलाई जस्तो समय-समयमा पोलिस गरिरहनु पर्दैन।</li>
        <li><strong>सस्तो र किफायती (Value for Money):</strong> प्रिमियम काठको तुलनामा स्टील फर्निचरको मूल्य आधा भन्दा कम हुन्छ र टिकाउपन दोब्बर हुन्छ।</li>
      </ol>

      <h3>निष्कर्ष</h3>
      <p>तराईको हावापानीका लागि स्टील फर्निचर एक बुद्धिमान र आर्थिक रूपमा फाइदाजनक निर्णय हो। <strong>श्री मनिष स्टील फर्निचर उद्योग, विराटनगर</strong> मा हामी तराईको मौसम सुहाउँदो एन्टी-रस्ट (खिया नलाग्ने) केमिकल ट्रीटमेन्ट र उत्कृष्ट पाउडर कोटिंग प्रविधि प्रयोग गरेर फर्निचरहरू उत्पादन गर्छौं। थप सोधपुछका लागि हामीलाई <strong>shreemanishfurniture@gmail.com</strong> मा इमेल पठाउन सक्नुहुन्छ।</p>
    `
  },
  {
    title: 'विराटनगर र इटहरीमा आधुनिक अफिस सेटअप: आवश्यक स्टील फर्निचर र डिजाइनहरू',
    slug: 'modern-office-furniture-setup-biratnagar-itahari',
    excerpt: 'के तपाईं विराटनगर वा इटहरीमा नयाँ अफिस खोल्दै हुनुहुन्छ? कार्यस्थललाई व्यवस्थित, आकर्षक र उत्पादनशील बनाउन आवश्यक पर्ने स्टील अफिस फर्निचर र फाइल क्याबिनेटहरू कसरी मिलाउने, यहाँ सिक्नुहोस्।',
    image: '/images/home-page-1.png',
    readTime: 5,
    tags: ['अफिस फर्निचर', 'Filing Cabinet', 'Office Desk Nepal', 'Biratnagar Office Setup'],
    metaTitle: 'Office Furniture Setup & Suppliers in Biratnagar, Itahari',
    metaDescription: 'Set up your workplace in Biratnagar or Itahari with ergonomic steel desks, filing cabinets, and wardrobes. Get custom corporate furniture directly from manufacturers.',
    content: `
      <h2>व्यवस्थित कार्यस्थलको लागि स्टील अफिस फर्निचर</h2>
      <p>कुनै पनि अफिस वा व्यावसायिक संस्थाको काम चुस्त राख्न र कर्मचारीहरूको उत्पादकत्व बढाउन उपयुक्त फर्निचरको ठूलो भूमिका हुन्छ। फाइलहरू सुरक्षित राख्न र कम्प्युटर तथा कागजात व्यवस्थापन गर्न <strong>स्टीलका अफिस फर्निचर</strong> सबैभन्दा उपयुक्त मानिन्छन्।</p>

      <h3>१. फाइल क्याबिनेटहरू (Filing Cabinets)</h3>
      <p>सरकारी कार्यालय, बैंक, कलेज र कर्पोरेट हाउसहरूमा फाइलहरूको भण्डारण प्रमुख चुनौती हो। स्टीलका ४-ड्रयर वा ३-ड्रयर भएका फाइल क्याबिनेटहरूले धेरै फाइलहरू कम ठाउँमा राख्न मद्दत गर्छन्। यी क्याबिनेटहरूमा सेन्ट्रल लक सिस्टम हुने भएकाले गोप्य कागजातहरू सुरक्षित रहन्छन्।</p>

      <h3>२. स्टील अफिस टेबल (Steel Office Desks)</h3>
      <p>काठको तुलनामा स्टीलका खुट्टा र फ्रेम भएका टेबलहरू लामो समयसम्म बलियो रहन्छन्। कम्प्युटर राख्ने कीबोर्ड ट्रे, साइड ड्रयर र सफा फिनिसिङ भएका आधुनिक डिजाइनका टेबलहरूले अफिसलाई व्यावसायिक लुक दिन्छन्।</p>

      <h3>३. स्टील र्याकहरू (Storage Racks)</h3>
      <p>स्टोर रुम वा रेकर्ड कोठाका लागि स्लोटेड एंगल र्याक (Slotted Angle Racks) उत्तम विकल्प हो। यसले फाइल र बक्सहरूलाई भर्टिकल्ली मिलाएर राख्न मद्दत गर्दछ, जसले कोठाको उपयोगिता बढाउँछ।</p>

      <h3>अफिस फर्निचर सेटअप गर्दा ध्यान दिनुपर्ने कुराहरू:</h3>
      <ul>
        <li><strong>स्पेस म्यानेजमेन्ट:</strong> कोठाको चौडाई अनुसार फर्निचर छनोट गर्नुहोस् ताकि हिँडडुल गर्न सजिलो होस्।</li>
        <li><strong>एर्गोनोमिक्स (Ergonomics):</strong> काम गर्दा सजिलो होस् भन्नका लागि टेबल र कुर्सीको उचाई मिल्दो हुनुपर्छ।</li>
        <li><strong>डिजाइन एकरूपता:</strong> सबै टेबल र क्याबिनेटहरूको रङ र कोटिंग मिल्दो भएमा अफिस राम्रो देखिन्छ।</li>
      </ul>

      <h3>विराटनगर र इटहरीमा कर्पोरेट अर्डर</h3>
      <p>हामी <strong>श्री मनिष स्टील फर्निचर उद्योग</strong> मार्फत बैंक, वित्तीय संस्था, सरकारी कार्यालय, सहकारी र निजी कम्पनीहरूका लागि थोक मूल्यमा अनुकूलित (Customized) साइजका टेबल, फाइल क्याबिनेट, दराज र सेफ लकरहरू आपूर्ति गर्दै आएका छौं। हामी विराटनगर, इटहरी, धरान र आसपासका क्षेत्रमा सोझै डेलिभरी र जडान (Installation) सेवा दिन्छौं। अर्डरको लागि आजै सम्पर्क गर्नुहोस्: <strong>9824336371</strong>।</p>
    `
  },
  {
    title: 'स्कुल, कलेज र ट्युसन सेन्टरका लागि गुणस्तरीय डेस्क र बेन्च: विराटनगरमा फर्निचर खरिद गाइड',
    slug: 'school-college-furniture-desks-benches-biratnagar',
    excerpt: 'शैक्षिक संस्थाहरूका लागि बलियो र टिकाउ डेस्क-बेन्च खोज्दै हुनुहुन्छ? विराटनगरमा स्कुल र कलेजका लागि आवश्यक पर्ने स्टील फ्रेमका फर्निचरहरूको मूल्य, गुणस्तर र फाइदाहरू यस लेखमा चर्चा गरिएको छ।',
    image: '/images/furniture-1.jpg',
    readTime: 5,
    tags: ['स्कुल फर्निचर', 'School Benches Nepal', 'College Desk', 'Tuition Center Furniture'],
    metaTitle: 'School and College Furniture Benches in Biratnagar, Nepal',
    metaDescription: 'Find high-quality, durable steel and wooden dual benches and desks for schools, colleges, and tuition centers in Biratnagar, Nepal at wholesale prices.',
    content: `
      <h2>शैक्षिक संस्थाका लागि स्टील फ्रेमका डेस्क-बेन्च किन रोज्ने?</h2>
      <p>स्कुल, कलेज र लोकसेवा तथा ट्युसन सेन्टरहरूमा फर्निचरको प्रयोग दैनिक रूपमा सयौं विद्यार्थीहरूद्वारा गरिन्छ। त्यसैले शैक्षिक फर्निचरहरू अत्यन्तै मजबुत, सजिलै नभाँचिने र विद्यार्थीहरूलाई बस्न सजिलो हुने (Ergonomic) हुनु आवश्यक छ। विगतमा काठका बेन्चहरू बढी प्रयोग गरिए पनि अहिले <strong>स्टील फ्रेम र प्लाइवुड/सनमाइका (Sunmica) जोडिएका डेस्क-बेन्च</strong> व्यापक रूपमा लोकप्रिय छन्।</p>

      <h3>स्टील फ्रेम डेस्क-बेन्चका प्रमुख फाइदाहरू:</h3>
      <ul>
        <li><strong>अत्यधिक मजबुत (High Strength):</strong> स्टील पाइप र च्यानल (Square/Round Pipes) बाट बनेका फ्रेमहरू विद्यार्थीहरूले जतिसुकै हल्लाए पनि सजिलै हल्लिँदैनन् र भाँच्चिदैनन्।</li>
        <li><strong>हल्का र सार्न सजिलो (Portability):</strong> पूरै काठको भारी बेन्चको तुलनामा स्टील फ्रेम भएका डेस्क-बेन्चहरू कोठा सरसफाइ गर्दा वा परीक्षाको समयमा सजिलै सार्न सकिन्छ।</li>
        <li><strong>मर्मत खर्च नहुने (Zero Maintenance):</strong> यी फर्निचरहरूमा धमिरा लाग्ने, काठ फुट्ने जस्ता समस्या हुँदैन। फलामे भागमा पाउडर कोटिंग गरिने हुँदा खिया लाग्दैन।</li>
        <li><strong>लामो आयु (Long Life):</strong> स्कुल कलेज जस्ता ठाउँमा जहाँ फर्निचरको रफ प्रयोग हुन्छ, स्टील फर्निचर १० देखि १५ वर्षसम्म सजिलै टिक्छ।</li>
      </ul>

      <h3>डेस्क-बेन्च छनोट गर्दा ध्यान दिनुपर्ने कुराहरू:</h3>
      <ol>
        <li><strong>पाइपको मोटाई (Gauge):</strong> सस्तो बनाउनका लागि पातलो पाइप प्रयोग गरिएको छ कि छैन ध्यान दिनुहोस्। सामान्यतया १६ वा १८ गेजको स्टील पाइप स्कुल फर्निचरका लागि उत्तम मानिन्छ।</li>
        <li><strong>सुरक्षित कुनाहरू (Rounded Corners):</strong> विद्यार्थीहरू हिँड्दा वा बस्दा चोट नलागोस् भन्नका लागि डेस्कका कुनाहरू गोलो र तातो टाँसिएको बोर्ड (Edge-banded) हुनुपर्छ।</li>
        <li><strong>साइज र उचाई (Size Options):</strong> प्राथमिक तहका साना बालबालिकाहरूका लागि होचो र माध्यमिक तथा कलेज तहका विद्यार्थीका लागि ठूलो साइजको डेस्क-बेन्च अर्डर गर्नुपर्छ।</li>
      </ol>

      <h3>थोक मूल्यमा उत्कृष्ट स्कुल फर्निचर</h3>
      <p><strong>श्री मनिष स्टील फर्निचर उद्योग, विराटनगर</strong> शैक्षिक फर्निचर उत्पादनमा अग्रणी छ। हामी विभिन्न संस्थाका लागि अनुकूलित डबल-डेस्क (Dual Desks), शिक्षकका लागि पोडियम र टेबल, लाइब्रेरीका र्याक र होस्टेलका स्टील बेडहरू (Bunk Beds) उत्पादन गर्छौं। विराटनगर र पूर्वी नेपालका सरकारी तथा निजी स्कुलहरूका लागि हामी विशेष थोक छुट र सिधै डेलिभरी सेवा उपलब्ध गराउँछौं। सम्पर्कको लागि फोन: <strong>9824336371</strong>।</p>
    `
  },
  {
    title: 'घर र व्यवसायको सुरक्षाको लागि बलियो सेफ वा तिजोरी (Tijori) कसरी छनोट गर्ने?',
    slug: 'how-to-choose-secure-safe-locker-tijori-nepal',
    excerpt: 'सुनचाँदी, पैसा र बहुमूल्य दस्ताबेजहरू सुरक्षित राख्न घर वा पसलमा बलियो सेफ (Tijori) को आवश्यकता पर्दछ। सुरक्षा सुविधाहरू, चाबी र लकिङ मेकानिजम जाँच गरी उत्तम सेफ कसरी छनोट गर्ने, विस्तृतमा जान्नुहोस्।',
    image: '/images/furniture-2.jpg',
    readTime: 6,
    tags: ['Safe Locker', 'Tijori Nepal', 'Security Safe Biratnagar', 'Home Security'],
    metaTitle: 'How to Choose the Best Safe Locker (Tijori) in Nepal',
    metaDescription: 'Compare safety lockers and heavy-duty steel safes (tijori) for homes and businesses in Nepal. Guide to locking systems, fire-resistance, and local manufacturing in Biratnagar.',
    content: `
      <h2>घर र व्यापारको सुरक्षाको आधार: तिजोरी (Tijori)</h2>
      <p>चोरी र आगलागी जस्ता जोखिमबाट आफ्ना बहुमूल्य गहना, नगद र महत्त्वपूर्ण सम्पत्तिका कागजातहरू बचाउन भरपर्दो र बलियो <strong>सेफ लकर वा तिजोरी (Tijori / Safety Locker)</strong> अनिवार्य छ। बजारमा पाइने साधारण दराजका लकरहरू भन्दा विशेष रूपमा तयार पारिएका तिजोरीहरू धेरै गुणा सुरक्षित हुन्छन्।</p>

      <h3>१. तिजोरी छनोट गर्दा हेर्नुपर्ने मुख्य प्राविधिक विशेषताहरू:</h3>
      <ul>
        <li><strong>डबल वाल बडी (Double Wall Body):</strong> प्रिमियम सेफहरू दोहोरो फलामे पाता र त्यसको बीचमा अग्निरोधक सामग्री (Fire-resistant filler) हालेर बनाइन्छ। यसले गर्दा बाहिरबाट सजिलै काट्न वा फुटाउन सकिँदैन।</li>
        <li><strong>तालाको प्रकार (Lock Types):</strong> बजारमा तीन प्रकारका लकहरू उपलब्ध छन्:
          <ul>
            <li><em>म्यानुअल चाबी (Key Lock):</em> परम्परागत तर धेरै भरपर्दो।</li>
            <li><em>मेकानिकल कम्बिनेसन (Dial Lock):</em> नम्बर घुमाएर खोलिने लक, जसमा चाबी हराउने चिन्ता हुँदैन।</li>
            <li><em>डिजिटल/बायोमेट्रिक लक (Digital/Fingerprint):</em> औंठाछाप वा कोड राखेर छिटो खोल्न सकिने आधुनिक लक।</li>
          </ul>
        </li>
        <li><strong>वजन र साइज (Weight & Size):</strong> तिजोरी जति गह्रौ भयो, चोरले उठाएर लैजान त्यति नै गाह्रो हुन्छ। घरायसी प्रयोजनका लागि ५० देखि १०० केजी सम्मको र पसल वा सहकारीका लागि १५० केजी भन्दा माथिको तिजोरी उपयुक्त हुन्छ।</li>
      </ul>

      <h3>२. तिजोरी राख्दा ध्यान दिनुपर्ने कुराहरू:</h3>
      <p>तिजोरीलाई जहिले पनि घरको यस्तो ठाउँमा राख्नुपर्छ जुन सजिलै बाहिरका मानिसको नजरमा नपरोस्। धेरैजसो मानिसहरूले यसलाई दराजको भित्र लुकाएर वा भित्तामा कङ्क्रिट जाम (Wall Anchor) गरेर राख्छन्।</p>

      <h3>३. श्री मनिष स्टीलका हेभी-ड्युटी तिजोरीहरू</h3>
      <p>हामी <strong>श्री मनिष स्टील फर्निचर उद्योग</strong> मा उच्च कोटीको कार्वन स्टील पाता प्रयोग गरी अत्याधुनिक डबल-लक र कम्बिनेसन लक भएका तिजोरीहरू उत्पादन गर्छौं। सहकारी, सुनचाँदी पसल र व्यक्तिगत प्रयोजनका लागि हाम्रा तिजोरीहरू पूर्व क्षेत्रमै प्रसिद्ध छन्। ग्राहकको माग अनुसार हामी विशेष अर्डरमा भारी वजनका अग्निरोधी सेफहरू पनि तयार गर्छौं। थप विवरणका लागि धरान रोड, विराटनगरमा अवस्थित हाम्रो शोरुममा आउनुहोस् वा हामीलाई <strong>9824336371</strong> मा कल गर्नुहोस्।</p>
    `
  },
  {
    title: 'विराटनगरको श्री मनिष स्टील फर्निचर किन ग्राहकहरूको पहिलो रोजाइ हो?',
    slug: 'leading-steel-furniture-manufacturer-biratnagar',
    excerpt: 'विगत १० वर्ष भन्दा बढी समयदेखि विराटनगर, धरान र इटहरी क्षेत्रमा सुपथ मूल्यमा उच्च गुणस्तरीय फलामे र काठका फर्निचरहरू उपलब्ध गराउँदै आएको श्री मनिष स्टील फर्निचर उद्योगका विशेषताहरू जान्नुहोस्।',
    image: '/images/home-page-1.png',
    readTime: 4,
    tags: ['Shree Manish Steel Furniture', 'Biratnagar local market', 'Furniture Factory Nepal', 'Dharan Itahari Delivery'],
    metaTitle: 'Shree Manish Steel Furniture - Best Furniture Shop in Biratnagar',
    metaDescription: 'Discover why Shree Manish Steel Furniture Udhyog is the preferred choice in Eastern Nepal (Biratnagar, Dharan, Itahari) for durable almirahs, beds, and office furniture.',
    content: `
      <h2>गुणस्तर र विश्वासको एक दशक: श्री मनिष स्टील फर्निचर उद्योग</h2>
      <p>आफ्नो नयाँ घर सजाउन वा पुरानो अफिसलाई नयाँ लुक दिन फर्निचरको आवश्यकता पर्दा हामी सधैं राम्रो र सस्तो विकल्पको खोजीमा हुन्छौं। विराटनगर र पूर्वी नेपालको बजारमा गुणस्तरीय र टिकाउ स्टील फर्निचरका लागि <strong>श्री मनिष स्टील फर्निचर उद्योग (Shree Manish Steel Furniture Udhyog)</strong> एउटा स्थापित र विश्वसनीय नाम हो।</p>

      <h3>हाम्रा विशेषताहरू जसले हामीलाई उत्कृष्ट बनाउँछन्:</h3>

      <h4>१. प्रत्यक्ष कारखानाबाट खरिद (Factory Direct Pricing)</h4>
      <p>हामी बिचौलिया वा अन्य डिलर बिना सोझै आफ्नै कारखानाबाट फर्निचर बिक्री गर्छौं। यसले गर्दा अन्य साधारण पसलहरूको तुलनामा हाम्रा उत्पादनहरू २०% देखि ३०% सम्म सस्तो मूल्यमा उपलब्ध हुन्छन्।</p>

      <h4>२. आवश्यकता अनुसारको डिजाइन (100% Customization)</h4>
      <p>तपाईंको कोठाको साइज वा अफिसको लेआउट अनुसार दराज, बेड वा र्याकको चौडाई, उचाई र आन्तरिक कम्पार्टमेन्ट (रक/घर्रा) अर्डर अनुसार बनाउन सकिन्छ। तपाईंले मन पराउनुभएको जुनसुकै रङ र बुट्टा हामी तयार पार्न सक्छौं।</p>

      <h4>३. उच्च गुणस्तरीय कच्चा पदार्थ (High-Grade Raw Materials)</h4>
      <p>हामी सधैं बजारको उत्कृष्ट कम्पनीको फलामे पाता, टिकाउ च्यानल, अत्याधुनिक लकहरू र खिया प्रतिरोधी पेन्ट तथा पाउडर कोटेड प्रविधिको मात्र प्रयोग गर्छौं। जसका कारण हाम्रा उत्पादनहरूमा ५ वर्षसम्मको वारेन्टी हुन्छ।</p>

      <h4>४. विराटनगर, धरान र इटहरी क्षेत्रमा डेलिभरी</h4>
      <p>तपाईंले खरिद गर्नुभएका सामग्रीहरू सुरक्षित रूपमा तपाईंको घर वा कार्यालयसम्म ढुवानी र जडान (Installation) गर्ने जिम्मा हाम्रो टोलीले लिन्छ।</p>

      <h3>हाम्रा मुख्य उत्पादनहरू:</h3>
      <ul>
        <li><strong>स्टील दराज (Double & Triple Door Almirahs)</strong></li>
        <li><strong>आधुनिक स्टील डबल बेड (Steel Beds / Double Khat)</strong></li>
        <li><strong>फाइल क्याबिनेट र अफिस टेबलहरू (Office furniture)</strong></li>
        <li><strong>स्कुल, कलेज तथा ट्युसन सेन्टरका डेस्क-बेन्चहरू</strong></li>
        <li><strong>घरायसी तथा व्यावसायिक सेफ र तिजोरीहरू (Tijori)</strong></li>
      </ul>

      <p>यदि तपाईं टिकाउ र आकर्षक फर्निचरको खोजीमा हुनुहुन्छ भने एक पटक विराटनगर धरान रोडमा रहेको हाम्रो शोरुममा अवश्य भ्रमण गर्नुहोस्। हामी तपाईंलाई उत्कृष्ट सेवाको विश्वास दिलाउँछौं। सम्पर्क नम्बर: <strong>+977 982-4336371</strong>।</p>
    `
  }
];

async function seedBlogs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB.');

    console.log('🧹 Cleaning existing blogs with matching slugs...');
    const slugs = blogsData.map(blog => blog.slug);
    const deleteResult = await Blog.deleteMany({ slug: { $in: slugs } });
    console.log(`🧹 Deleted ${deleteResult.deletedCount} existing matching blogs.`);

    console.log('🌱 Inserting 6 new SEO blogs...');
    const insertedBlogs = await Blog.insertMany(blogsData);
    console.log(`🌱 Successfully seeded ${insertedBlogs.length} blogs!`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    process.exit(1);
  }
}

seedBlogs();
