import mongoose, { 
  Document, 
  Types, 
  ObjectId, 
  Model } from 'mongoose';



  // enum category = {
  //   "Video Production": [ 'Wedding Films', "Social Media Videos", "Music Videos", "Influencer Collabs",  ],
  //   "Video Editing": ["Color Collection", "Instagram Videos", "Wedding Video Editors", "Music Videos", "Youtube Videos", "Commercials"],
  //   "Sound": ["Sync Sound", "Dubbing Artist", "SFX Editing", "Mixing and Mastering", "Music Direction"]
  //   "Writers": ["Content Writers", "Script Writers"],
  //   "Photographers": ["Wedding Photography", "Product Photography", "Photoshoots", "Real Estate Photography" "Food Photography"],
  //   "Visual Graphics": ["Social Media Animations", "Logo and Subtitles", "Illustrators", "Intros and Outros", "VFX and Motion Graphics", Graphic Designers"]

  // }

interface PackageObject {
  per: string;
  price: string;
  description: string;
}

interface CategoryObject {
  id: Types.ObjectId;
  name: string;
  subCategories:Array<Types.ObjectId>;
}

interface subCategoryObject {
  id: Types.ObjectId;
  name: string;
  category:Types.ObjectId;
}


export interface IGigDocument extends Document {
  owner: Types.ObjectId;
  title: string;
  category?: string;
  subCategory?: string;
  tags?:  Types.Array<string>;
  description?: string;
  note?: string;     
  packages: Array<{
    name: 'basic' | 'premium' | 'custom';
    per: string;
    price: string;
    description: string;
  }>;
  faqs?: Array<{
    question: string;
    answer:string;
  }>;

           // a short note/fyi for the gig
 
 // overtime?: PackageObject;
  status: 'isDraft' | 'isLive';
  createdAt: Date;
  orders?: Array<Types.ObjectId>;
}

const GigSchema = new mongoose.Schema<IGigDocument>({
  owner: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true
  },
  title: {
    type: String,
   
  },
  category: {
    type: String,
   
  },
  subCategory: {
    type: String,
   
  },
 
  description: {
    type: String,
  },
  note: {
    type: String,
  },
  packages: [
    {
      name: {
        type: String,
        enum: ['basic', 'premium', 'custom'],
      },
      per: {
        type: String,
      },
      price: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  faqs: [
    {
      question: String,
      answer: String,
    }
  ],
 
  // overtime: {
  //   per: String,
  //   price: String,
  //   description: String,
  // },
  
  status : {
    type: String,
    default: 'isDraft'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
});

GigSchema.index({ category: 'text', subCategory: 'text' });


const Gig: Model<IGigDocument> = mongoose.model<IGigDocument>('Gig', GigSchema);

export default Gig;