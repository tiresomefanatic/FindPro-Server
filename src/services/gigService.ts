import { Types } from 'mongoose';
import Gig, { IGigDocument } from '../models/gigModel';
import User from '../models/usersModel';

export const createGigService = async (ownerId: string): Promise<IGigDocument> => {
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
  const updatedGig = await Gig.findByIdAndUpdate(gigId, updateData, { new: true });
  return updatedGig;
};

export const deleteGigService = async (gigId: string): Promise<IGigDocument | null> => {
  const deletedGig = await Gig.findByIdAndDelete(gigId);
  return deletedGig;
};

export const getGigByIdService = async (gigId: string): Promise<IGigDocument | null> => {
  const gig = await Gig.findOne({ _id: gigId })
  return gig;
};

export const getGigsService = async (page: number, limit: number, category?: string, subCategory?: string, searchTerm?: string) => {
  const skip = (page - 1) * limit;

  
  const query = Gig.find().populate({
    path: 'owner',
    model: 'User',
    select: 'firstName lastName skills',
  });

  
  const filterConditions: any = {};

 
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
    const gigs = await Gig.find({ owner: ownerId }).populate('owner', 'firstName lastName').exec();
    return gigs;
  } catch (error) {
    throw new Error('Failed to retrieve gigs by owner');
  }
};

export const getGigsByCategoryService = async () => {
  try {
    const gigsByCategory = await Gig.aggregate([
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
                          firstName: '$$user.firstName',
                          lastName: '$$user.lastName',
                        },
                      },
                    },
                    0,
                  ],
                },
                title: '$$gig.title',
                category: '$$gig.category',
                subcategory: '$$gig.subCategory',
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

  return { bookmarked: !isBookmarked };
};





export const getBookmarkedGigsService = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }
   
    //console.log("user", user)
    const bookmarkedGigIds = user.bookmarkedGigs;

    const bookmarkedGigs = await Gig.find({ _id: { $in: bookmarkedGigIds } })
      .select('owner packages')
      .populate({
        path: 'owner',
        select: 'firstName lastName',
      });

    const formattedBookmarkedGigs = bookmarkedGigs.map((gig: any) => ({
      id: gig._id,
      owner: {
        firstName: gig.owner.firstName,
        lastName: gig.owner.lastName,
      },
      price: gig.packages[0].price,
    }));

    return formattedBookmarkedGigs;
  } catch (error) {
    throw new Error('Failed to retrieve bookmarked gigs');
  }
};