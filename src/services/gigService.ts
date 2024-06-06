import { ObjectId, Types } from 'mongoose';
import Gig, { IGigDocument } from '../models/gigModel';
import User from '../models/usersModel';

export const createGigService = async (ownerId: Types.ObjectId): Promise<IGigDocument> => {
  const ownerUser = await User.findById(ownerId);
  if (!ownerUser) {
    throw new Error('Invalid owner');
  }

  const defaultPackages = [
    { name: 'basic', per: '', price: '', description: '' },
    { name: 'premium', per: '', price: '', description: '' },
    { name: 'custom', per: '', price: '', description: '' },
  ];

  const newGig: IGigDocument = new Gig({
    owner: ownerUser.id,
    title: 'Draft',
    packages: defaultPackages,
    faqs: [],
    status: 'isDraft'
  });

  const savedGig: IGigDocument = await newGig.save();
  return savedGig;
};

// ...

export const updateGigService = async (
  gigId: string,
  updateData: Partial<IGigDocument>
): Promise<IGigDocument | null> => {
  //console.log("updating data", updateData)
  const updatedGig = await Gig.findByIdAndUpdate(gigId, updateData, { new: true });
 // console.log("NEW DATA", updatedGig)
  return updatedGig;
};

export const deleteGigService = async (gigId: string): Promise<IGigDocument | null> => {
  try {
    const deletedGig = await Gig.findByIdAndDelete(gigId);

    if (deletedGig) {
      // Remove the deleted gig's ID from all users' bookmarkedGigs array
      await User.updateMany(
        { bookmarkedGigs: gigId },
        { $pull: { bookmarkedGigs: gigId } }
      );
    }

    return deletedGig;
  } catch (error) {
    console.error('Error deleting gig:', error);
    throw new Error('Failed to delete gig');
  }
};

export const getGigByIdService = async (gigId: string): Promise<IGigDocument | null> => {
  const gig = await Gig.findOne({ _id: gigId }).populate({
    path: 'owner',
    model: 'User',
    select: 'name skills profilePic location languages',
  }).exec();
  return gig;
};

// export const getGigByIdService = async (gigId: string): Promise<IGigDocument | null> => {
//   const gig = await Gig.findOne(
//     { _id: gigId },
//     { 'portfolioMedia._id': 0 }
//   );
//   return gig;
// };

export const getGigsService = async (page: number, limit: number, category?: string, subCategory?: string, searchTerm?: string) => {
  const skip = (page - 1) * limit;

  
  const query = Gig.find().populate({
    path: 'owner',
    model: 'User',
    select: 'name skills profilePic',
  });

  
  const filterConditions: any = {status: 'isLive'};

 
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i');

    filterConditions.$or = [
      { category: searchRegex },
      { subCategory: searchRegex },
    ];
  } else {
    if (category) {
      filterConditions.category = category;
    }
    if (subCategory) {
      filterConditions.subCategory = subCategory;
    }
  }

  query.setQuery(filterConditions);


  const totalCount = await Gig.countDocuments(query.getQuery());
  const totalPages = Math.ceil(totalCount / limit);
  

  const gigs = await query
    .skip(skip)
    .limit(limit)
    .sort({ category: 1, subcategory: 1 })
    .exec();
    
//console.log('Database Query:', query);
//console.log('Gigs Result:', gigs);

  return {
    gigs,
    currentPage: page,
    totalPages,
    totalCount,
  };
  
};

export const getGigsByOwnerService = async (ownerId: string) => {
  try {
    const gigs = await Gig.find({ owner: ownerId }).populate('owner', 'name skills profilePic').exec();
    return gigs;
  } catch (error) {
    throw new Error('Failed to retrieve gigs by owner');
  }
};

export const getGigsByCategoryService = async () => {
  try {
    const gigsByCategory = await Gig.aggregate([
      
      {
        $match: {
          status: 'isLive', // Add this stage to filter only live gigs
        },
      },
      
      {
        $group: {
          _id: '$category',
          gigs: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'gigs.owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          gigs: {
            $map: {
              input: '$gigs',
              as: 'gig',
              in: {
                _id: '$$gig._id',
                owner: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$owner',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$gig.owner'] },
                          },
                        },
                        as: 'user',
                        in: {
                          _id: '$$user._id',
                          name: '$$user.name',
                          skills: '$$user.skills',
                          profilePic: '$$user.profilePic'
                        },
                      },
                    },
                    0,
                  ],
                },
                title: '$$gig.title',
                packages: `$$gig.packages`,
                portfolioMedia: '$$gig.portfolioMedia',
                // Include other fields as needed
              },
            },
          },
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]).exec();

    return gigsByCategory;
  } catch (error) {
    throw new Error('Failed to retrieve gigs by category');
  }
};

export const bookmarkGigService = async (userId: Types.ObjectId, gigId: Types.ObjectId): Promise<{ bookmarked: boolean }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  ;

  const isBookmarked = user.bookmarkedGigs.some((id) => id.equals(gigId));

  if (isBookmarked) {
    // Remove the gigId from the bookmarkedGigs array
    user.bookmarkedGigs = user.bookmarkedGigs.filter((id) => !id.equals(gigId));
  } else {
    // Add the gigId to the bookmarkedGigs array
    user.bookmarkedGigs.push(gigId);
  }

  await user.save();

  console.log('bookmarked?', isBookmarked)

  return { bookmarked: !isBookmarked };
};




export const getBookmarkedGigsService = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
  

    const bookmarkedGigIds = user.bookmarkedGigs;
    const bookmarkedGigs = await Gig.find({ _id: { $in: bookmarkedGigIds } })
      .select('owner packages')
      .populate({
         path: 'owner',
         model: 'User',
         select: 'firstName skills' 
      })

      

     

   

    console.log('Hit the server means no cacche');
    return bookmarkedGigs;
  } catch (error) {
    console.log('error from serice getbookmarked', error);
    throw new Error('Failed to retrieve bookmarked gigs');
  }
};

export const makeGigLiveService = async (gigId: string): Promise<IGigDocument | null> => {
  const gig = await Gig.findById(gigId);

  if (!gig) {
    return null;
  }

  const requiredFields: (keyof IGigDocument)[] = ['title', 'description', 'category', 'subCategory', 'packages'];

  for (const field of requiredFields) {
    if (!gig[field] || (Array.isArray(gig[field]) && gig[field].length === 0)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  gig.status = 'isLive';
  const updatedGig = await gig.save();

  return updatedGig;
};

export const makeGigDraftService = async (gigId: string): Promise<IGigDocument | null> => {
  const gig = await Gig.findById(gigId);

  if (!gig) {
    return null;
  }

  gig.status = 'isDraft';
  const updatedGig = await gig.save();

  return updatedGig;
};