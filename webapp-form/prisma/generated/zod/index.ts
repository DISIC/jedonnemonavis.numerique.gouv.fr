import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','firstName','lastName','active','observatoire_account','observatoire_username','email','password','role','created_at','updated_at']);

export const UserRequestScalarFieldEnumSchema = z.enum(['id','user_id','user_email_copy','reason','mode','status','created_at','updated_at']);

export const UserOTPScalarFieldEnumSchema = z.enum(['id','user_id','code','expiration_date','created_at','updated_at']);

export const UserValidationTokenScalarFieldEnumSchema = z.enum(['id','user_id','token','created_at','updated_at']);

export const UserInviteTokenScalarFieldEnumSchema = z.enum(['id','user_email','token','created_at','updated_at']);

export const EntityScalarFieldEnumSchema = z.enum(['id','name','acronym','created_at','updated_at']);

export const ButtonScalarFieldEnumSchema = z.enum(['id','title','description','isTest','product_id','created_at','updated_at']);

export const ProductScalarFieldEnumSchema = z.enum(['id','title','entity_id','created_at','updated_at','isEssential','urls','volume','observatoire_id']);

export const AccessRightScalarFieldEnumSchema = z.enum(['id','user_email','user_email_invite','product_id','status','created_at','updated_at']);

export const WhiteListedDomainScalarFieldEnumSchema = z.enum(['id','domain','created_at','updated_at']);

export const FavoriteScalarFieldEnumSchema = z.enum(['user_id','product_id','created_at','updated_at']);

export const ReviewScalarFieldEnumSchema = z.enum(['id','form_id','product_id','button_id','created_at']);

export const AnswerScalarFieldEnumSchema = z.enum(['id','field_label','field_code','answer_item_id','answer_text','kind','review_id']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const UserOrderByRelevanceFieldEnumSchema = z.enum(['firstName','lastName','observatoire_username','email','password']);

export const UserRequestOrderByRelevanceFieldEnumSchema = z.enum(['user_email_copy','reason']);

export const UserOTPOrderByRelevanceFieldEnumSchema = z.enum(['code']);

export const UserValidationTokenOrderByRelevanceFieldEnumSchema = z.enum(['token']);

export const UserInviteTokenOrderByRelevanceFieldEnumSchema = z.enum(['user_email','token']);

export const EntityOrderByRelevanceFieldEnumSchema = z.enum(['name','acronym']);

export const ButtonOrderByRelevanceFieldEnumSchema = z.enum(['title','description']);

export const ProductOrderByRelevanceFieldEnumSchema = z.enum(['title','urls']);

export const AccessRightOrderByRelevanceFieldEnumSchema = z.enum(['user_email','user_email_invite']);

export const WhiteListedDomainOrderByRelevanceFieldEnumSchema = z.enum(['domain']);

export const AnswerOrderByRelevanceFieldEnumSchema = z.enum(['field_label','field_code','answer_text']);

export const UserRoleSchema = z.enum(['admin','supervisor','user']);

export type UserRoleType = `${z.infer<typeof UserRoleSchema>}`

export const RequestModeSchema = z.enum(['whitelist','superuser']);

export type RequestModeType = `${z.infer<typeof RequestModeSchema>}`

export const UserRequestStatusSchema = z.enum(['pending','accepted','refused']);

export type UserRequestStatusType = `${z.infer<typeof UserRequestStatusSchema>}`

export const RightAccessStatusSchema = z.enum(['carrier','removed']);

export type RightAccessStatusType = `${z.infer<typeof RightAccessStatusSchema>}`

export const AnswerKindSchema = z.enum(['text','checkbox','radio']);

export type AnswerKindType = `${z.infer<typeof AnswerKindSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: UserRoleSchema,
  id: z.number().int(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  active: z.boolean(),
  observatoire_account: z.boolean(),
  observatoire_username: z.string().nullable(),
  email: z.string(),
  password: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER REQUEST SCHEMA
/////////////////////////////////////////

export const UserRequestSchema = z.object({
  mode: RequestModeSchema,
  status: UserRequestStatusSchema,
  id: z.number().int(),
  user_id: z.number().int().nullable(),
  user_email_copy: z.string().nullable(),
  reason: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type UserRequest = z.infer<typeof UserRequestSchema>

/////////////////////////////////////////
// USER OTP SCHEMA
/////////////////////////////////////////

export const UserOTPSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type UserOTP = z.infer<typeof UserOTPSchema>

/////////////////////////////////////////
// USER VALIDATION TOKEN SCHEMA
/////////////////////////////////////////

export const UserValidationTokenSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  token: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type UserValidationToken = z.infer<typeof UserValidationTokenSchema>

/////////////////////////////////////////
// USER INVITE TOKEN SCHEMA
/////////////////////////////////////////

export const UserInviteTokenSchema = z.object({
  id: z.number().int(),
  user_email: z.string(),
  token: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type UserInviteToken = z.infer<typeof UserInviteTokenSchema>

/////////////////////////////////////////
// ENTITY SCHEMA
/////////////////////////////////////////

export const EntitySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Entity = z.infer<typeof EntitySchema>

/////////////////////////////////////////
// BUTTON SCHEMA
/////////////////////////////////////////

export const ButtonSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  isTest: z.boolean().nullable(),
  product_id: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Button = z.infer<typeof ButtonSchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  entity_id: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  isEssential: z.boolean().nullable(),
  urls: z.string().array(),
  volume: z.number().int().nullable(),
  observatoire_id: z.number().int().nullable(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// ACCESS RIGHT SCHEMA
/////////////////////////////////////////

export const AccessRightSchema = z.object({
  status: RightAccessStatusSchema,
  id: z.number().int(),
  user_email: z.string().nullable(),
  user_email_invite: z.string().nullable(),
  product_id: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type AccessRight = z.infer<typeof AccessRightSchema>

/////////////////////////////////////////
// WHITE LISTED DOMAIN SCHEMA
/////////////////////////////////////////

export const WhiteListedDomainSchema = z.object({
  id: z.number().int(),
  domain: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type WhiteListedDomain = z.infer<typeof WhiteListedDomainSchema>

/////////////////////////////////////////
// FAVORITE SCHEMA
/////////////////////////////////////////

export const FavoriteSchema = z.object({
  user_id: z.number().int(),
  product_id: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Favorite = z.infer<typeof FavoriteSchema>

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  id: z.number().int(),
  form_id: z.number().int(),
  product_id: z.number().int(),
  button_id: z.number().int(),
  created_at: z.coerce.date(),
})

export type Review = z.infer<typeof ReviewSchema>

/////////////////////////////////////////
// ANSWER SCHEMA
/////////////////////////////////////////

export const AnswerSchema = z.object({
  kind: AnswerKindSchema,
  id: z.number().int(),
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number().int(),
  answer_text: z.string(),
  review_id: z.number().int(),
})

export type Answer = z.infer<typeof AnswerSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  UserOTPs: z.union([z.boolean(),z.lazy(() => UserOTPFindManyArgsSchema)]).optional(),
  UserValidationTokens: z.union([z.boolean(),z.lazy(() => UserValidationTokenFindManyArgsSchema)]).optional(),
  UserRequests: z.union([z.boolean(),z.lazy(() => UserRequestFindManyArgsSchema)]).optional(),
  accessRights: z.union([z.boolean(),z.lazy(() => AccessRightFindManyArgsSchema)]).optional(),
  entities: z.union([z.boolean(),z.lazy(() => EntityFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  UserOTPs: z.boolean().optional(),
  UserValidationTokens: z.boolean().optional(),
  UserRequests: z.boolean().optional(),
  accessRights: z.boolean().optional(),
  entities: z.boolean().optional(),
  favorites: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  role: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  UserOTPs: z.union([z.boolean(),z.lazy(() => UserOTPFindManyArgsSchema)]).optional(),
  UserValidationTokens: z.union([z.boolean(),z.lazy(() => UserValidationTokenFindManyArgsSchema)]).optional(),
  UserRequests: z.union([z.boolean(),z.lazy(() => UserRequestFindManyArgsSchema)]).optional(),
  accessRights: z.union([z.boolean(),z.lazy(() => AccessRightFindManyArgsSchema)]).optional(),
  entities: z.union([z.boolean(),z.lazy(() => EntityFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER REQUEST
//------------------------------------------------------

export const UserRequestIncludeSchema: z.ZodType<Prisma.UserRequestInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserRequestArgsSchema: z.ZodType<Prisma.UserRequestDefaultArgs> = z.object({
  select: z.lazy(() => UserRequestSelectSchema).optional(),
  include: z.lazy(() => UserRequestIncludeSchema).optional(),
}).strict();

export const UserRequestSelectSchema: z.ZodType<Prisma.UserRequestSelect> = z.object({
  id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  user_email_copy: z.boolean().optional(),
  reason: z.boolean().optional(),
  mode: z.boolean().optional(),
  status: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER OTP
//------------------------------------------------------

export const UserOTPIncludeSchema: z.ZodType<Prisma.UserOTPInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserOTPArgsSchema: z.ZodType<Prisma.UserOTPDefaultArgs> = z.object({
  select: z.lazy(() => UserOTPSelectSchema).optional(),
  include: z.lazy(() => UserOTPIncludeSchema).optional(),
}).strict();

export const UserOTPSelectSchema: z.ZodType<Prisma.UserOTPSelect> = z.object({
  id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  code: z.boolean().optional(),
  expiration_date: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER VALIDATION TOKEN
//------------------------------------------------------

export const UserValidationTokenIncludeSchema: z.ZodType<Prisma.UserValidationTokenInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserValidationTokenArgsSchema: z.ZodType<Prisma.UserValidationTokenDefaultArgs> = z.object({
  select: z.lazy(() => UserValidationTokenSelectSchema).optional(),
  include: z.lazy(() => UserValidationTokenIncludeSchema).optional(),
}).strict();

export const UserValidationTokenSelectSchema: z.ZodType<Prisma.UserValidationTokenSelect> = z.object({
  id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  token: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER INVITE TOKEN
//------------------------------------------------------

export const UserInviteTokenSelectSchema: z.ZodType<Prisma.UserInviteTokenSelect> = z.object({
  id: z.boolean().optional(),
  user_email: z.boolean().optional(),
  token: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
}).strict()

// ENTITY
//------------------------------------------------------

export const EntityIncludeSchema: z.ZodType<Prisma.EntityInclude> = z.object({
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  users: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EntityCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const EntityArgsSchema: z.ZodType<Prisma.EntityDefaultArgs> = z.object({
  select: z.lazy(() => EntitySelectSchema).optional(),
  include: z.lazy(() => EntityIncludeSchema).optional(),
}).strict();

export const EntityCountOutputTypeArgsSchema: z.ZodType<Prisma.EntityCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => EntityCountOutputTypeSelectSchema).nullish(),
}).strict();

export const EntityCountOutputTypeSelectSchema: z.ZodType<Prisma.EntityCountOutputTypeSelect> = z.object({
  products: z.boolean().optional(),
  users: z.boolean().optional(),
}).strict();

export const EntitySelectSchema: z.ZodType<Prisma.EntitySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  acronym: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  users: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => EntityCountOutputTypeArgsSchema)]).optional(),
}).strict()

// BUTTON
//------------------------------------------------------

export const ButtonIncludeSchema: z.ZodType<Prisma.ButtonInclude> = z.object({
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ButtonCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ButtonArgsSchema: z.ZodType<Prisma.ButtonDefaultArgs> = z.object({
  select: z.lazy(() => ButtonSelectSchema).optional(),
  include: z.lazy(() => ButtonIncludeSchema).optional(),
}).strict();

export const ButtonCountOutputTypeArgsSchema: z.ZodType<Prisma.ButtonCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ButtonCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ButtonCountOutputTypeSelectSchema: z.ZodType<Prisma.ButtonCountOutputTypeSelect> = z.object({
  reviews: z.boolean().optional(),
}).strict();

export const ButtonSelectSchema: z.ZodType<Prisma.ButtonSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  isTest: z.boolean().optional(),
  product_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ButtonCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PRODUCT
//------------------------------------------------------

export const ProductIncludeSchema: z.ZodType<Prisma.ProductInclude> = z.object({
  entity: z.union([z.boolean(),z.lazy(() => EntityArgsSchema)]).optional(),
  buttons: z.union([z.boolean(),z.lazy(() => ButtonFindManyArgsSchema)]).optional(),
  accessRights: z.union([z.boolean(),z.lazy(() => AccessRightFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ProductArgsSchema: z.ZodType<Prisma.ProductDefaultArgs> = z.object({
  select: z.lazy(() => ProductSelectSchema).optional(),
  include: z.lazy(() => ProductIncludeSchema).optional(),
}).strict();

export const ProductCountOutputTypeArgsSchema: z.ZodType<Prisma.ProductCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ProductCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ProductCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCountOutputTypeSelect> = z.object({
  buttons: z.boolean().optional(),
  accessRights: z.boolean().optional(),
  favorites: z.boolean().optional(),
  reviews: z.boolean().optional(),
}).strict();

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  entity_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  isEssential: z.boolean().optional(),
  urls: z.boolean().optional(),
  volume: z.boolean().optional(),
  observatoire_id: z.boolean().optional(),
  entity: z.union([z.boolean(),z.lazy(() => EntityArgsSchema)]).optional(),
  buttons: z.union([z.boolean(),z.lazy(() => ButtonFindManyArgsSchema)]).optional(),
  accessRights: z.union([z.boolean(),z.lazy(() => AccessRightFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ACCESS RIGHT
//------------------------------------------------------

export const AccessRightIncludeSchema: z.ZodType<Prisma.AccessRightInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

export const AccessRightArgsSchema: z.ZodType<Prisma.AccessRightDefaultArgs> = z.object({
  select: z.lazy(() => AccessRightSelectSchema).optional(),
  include: z.lazy(() => AccessRightIncludeSchema).optional(),
}).strict();

export const AccessRightSelectSchema: z.ZodType<Prisma.AccessRightSelect> = z.object({
  id: z.boolean().optional(),
  user_email: z.boolean().optional(),
  user_email_invite: z.boolean().optional(),
  product_id: z.boolean().optional(),
  status: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

// WHITE LISTED DOMAIN
//------------------------------------------------------

export const WhiteListedDomainSelectSchema: z.ZodType<Prisma.WhiteListedDomainSelect> = z.object({
  id: z.boolean().optional(),
  domain: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
}).strict()

// FAVORITE
//------------------------------------------------------

export const FavoriteIncludeSchema: z.ZodType<Prisma.FavoriteInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

export const FavoriteArgsSchema: z.ZodType<Prisma.FavoriteDefaultArgs> = z.object({
  select: z.lazy(() => FavoriteSelectSchema).optional(),
  include: z.lazy(() => FavoriteIncludeSchema).optional(),
}).strict();

export const FavoriteSelectSchema: z.ZodType<Prisma.FavoriteSelect> = z.object({
  user_id: z.boolean().optional(),
  product_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
}).strict()

// REVIEW
//------------------------------------------------------

export const ReviewIncludeSchema: z.ZodType<Prisma.ReviewInclude> = z.object({
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  button: z.union([z.boolean(),z.lazy(() => ButtonArgsSchema)]).optional(),
  answers: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReviewCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ReviewArgsSchema: z.ZodType<Prisma.ReviewDefaultArgs> = z.object({
  select: z.lazy(() => ReviewSelectSchema).optional(),
  include: z.lazy(() => ReviewIncludeSchema).optional(),
}).strict();

export const ReviewCountOutputTypeArgsSchema: z.ZodType<Prisma.ReviewCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ReviewCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ReviewCountOutputTypeSelectSchema: z.ZodType<Prisma.ReviewCountOutputTypeSelect> = z.object({
  answers: z.boolean().optional(),
}).strict();

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z.object({
  id: z.boolean().optional(),
  form_id: z.boolean().optional(),
  product_id: z.boolean().optional(),
  button_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  button: z.union([z.boolean(),z.lazy(() => ButtonArgsSchema)]).optional(),
  answers: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReviewCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ANSWER
//------------------------------------------------------

export const AnswerIncludeSchema: z.ZodType<Prisma.AnswerInclude> = z.object({
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict()

export const AnswerArgsSchema: z.ZodType<Prisma.AnswerDefaultArgs> = z.object({
  select: z.lazy(() => AnswerSelectSchema).optional(),
  include: z.lazy(() => AnswerIncludeSchema).optional(),
}).strict();

export const AnswerSelectSchema: z.ZodType<Prisma.AnswerSelect> = z.object({
  id: z.boolean().optional(),
  field_label: z.boolean().optional(),
  field_code: z.boolean().optional(),
  answer_item_id: z.boolean().optional(),
  answer_text: z.boolean().optional(),
  kind: z.boolean().optional(),
  review_id: z.boolean().optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  active: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_account: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserOTPs: z.lazy(() => UserOTPListRelationFilterSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenListRelationFilterSchema).optional(),
  UserRequests: z.lazy(() => UserRequestListRelationFilterSchema).optional(),
  accessRights: z.lazy(() => AccessRightListRelationFilterSchema).optional(),
  entities: z.lazy(() => EntityListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.UserOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  observatoire_account: z.lazy(() => SortOrderSchema).optional(),
  observatoire_username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  UserOTPs: z.lazy(() => UserOTPOrderByRelationAggregateInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenOrderByRelationAggregateInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestOrderByRelationAggregateInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightOrderByRelationAggregateInputSchema).optional(),
  entities: z.lazy(() => EntityOrderByRelationAggregateInputSchema).optional(),
  favorites: z.lazy(() => FavoriteOrderByRelationAggregateInputSchema).optional(),
  _relevance: z.lazy(() => UserOrderByRelevanceInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    email: z.string()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  active: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_account: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  password: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserOTPs: z.lazy(() => UserOTPListRelationFilterSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenListRelationFilterSchema).optional(),
  UserRequests: z.lazy(() => UserRequestListRelationFilterSchema).optional(),
  accessRights: z.lazy(() => AccessRightListRelationFilterSchema).optional(),
  entities: z.lazy(() => EntityListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  observatoire_account: z.lazy(() => SortOrderSchema).optional(),
  observatoire_username: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  active: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  observatoire_account: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  observatoire_username: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleWithAggregatesFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserRequestWhereInputSchema: z.ZodType<Prisma.UserRequestWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRequestWhereInputSchema),z.lazy(() => UserRequestWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRequestWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRequestWhereInputSchema),z.lazy(() => UserRequestWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  user_email_copy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reason: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mode: z.union([ z.lazy(() => EnumRequestModeFilterSchema),z.lazy(() => RequestModeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserRequestStatusFilterSchema),z.lazy(() => UserRequestStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const UserRequestOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.UserRequestOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user_email_copy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  mode: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  _relevance: z.lazy(() => UserRequestOrderByRelevanceInputSchema).optional()
}).strict();

export const UserRequestWhereUniqueInputSchema: z.ZodType<Prisma.UserRequestWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    user_id: z.number()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    user_id: z.number(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  user_id: z.number().optional(),
  AND: z.union([ z.lazy(() => UserRequestWhereInputSchema),z.lazy(() => UserRequestWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRequestWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRequestWhereInputSchema),z.lazy(() => UserRequestWhereInputSchema).array() ]).optional(),
  user_email_copy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reason: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mode: z.union([ z.lazy(() => EnumRequestModeFilterSchema),z.lazy(() => RequestModeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserRequestStatusFilterSchema),z.lazy(() => UserRequestStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const UserRequestOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserRequestOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user_email_copy: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  mode: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserRequestCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserRequestAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserRequestMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserRequestMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserRequestSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserRequestScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserRequestScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserRequestScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRequestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRequestScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRequestScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRequestScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  user_email_copy: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  reason: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  mode: z.union([ z.lazy(() => EnumRequestModeWithAggregatesFilterSchema),z.lazy(() => RequestModeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserRequestStatusWithAggregatesFilterSchema),z.lazy(() => UserRequestStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserOTPWhereInputSchema: z.ZodType<Prisma.UserOTPWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserOTPWhereInputSchema),z.lazy(() => UserOTPWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOTPWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOTPWhereInputSchema),z.lazy(() => UserOTPWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiration_date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserOTPOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.UserOTPOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  expiration_date: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  _relevance: z.lazy(() => UserOTPOrderByRelevanceInputSchema).optional()
}).strict();

export const UserOTPWhereUniqueInputSchema: z.ZodType<Prisma.UserOTPWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    user_id: z.number(),
    code: z.string()
  }),
  z.object({
    id: z.number(),
    user_id: z.number(),
  }),
  z.object({
    id: z.number(),
    code: z.string(),
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    user_id: z.number(),
    code: z.string(),
  }),
  z.object({
    user_id: z.number(),
  }),
  z.object({
    code: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  user_id: z.number().optional(),
  code: z.string().optional(),
  AND: z.union([ z.lazy(() => UserOTPWhereInputSchema),z.lazy(() => UserOTPWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOTPWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOTPWhereInputSchema),z.lazy(() => UserOTPWhereInputSchema).array() ]).optional(),
  expiration_date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserOTPOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOTPOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  expiration_date: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserOTPCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserOTPAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserOTPMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserOTPMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserOTPSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserOTPScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserOTPScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserOTPScalarWhereWithAggregatesInputSchema),z.lazy(() => UserOTPScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOTPScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOTPScalarWhereWithAggregatesInputSchema),z.lazy(() => UserOTPScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiration_date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserValidationTokenWhereInputSchema: z.ZodType<Prisma.UserValidationTokenWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserValidationTokenWhereInputSchema),z.lazy(() => UserValidationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserValidationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserValidationTokenWhereInputSchema),z.lazy(() => UserValidationTokenWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.UserValidationTokenOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  _relevance: z.lazy(() => UserValidationTokenOrderByRelevanceInputSchema).optional()
}).strict();

export const UserValidationTokenWhereUniqueInputSchema: z.ZodType<Prisma.UserValidationTokenWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    user_id: z.number(),
    token: z.string()
  }),
  z.object({
    id: z.number(),
    user_id: z.number(),
  }),
  z.object({
    id: z.number(),
    token: z.string(),
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    user_id: z.number(),
    token: z.string(),
  }),
  z.object({
    user_id: z.number(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  user_id: z.number().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => UserValidationTokenWhereInputSchema),z.lazy(() => UserValidationTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserValidationTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserValidationTokenWhereInputSchema),z.lazy(() => UserValidationTokenWhereInputSchema).array() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserValidationTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserValidationTokenOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserValidationTokenCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserValidationTokenAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserValidationTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserValidationTokenMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserValidationTokenSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserValidationTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserValidationTokenScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserValidationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserValidationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserValidationTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserValidationTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserValidationTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserInviteTokenWhereInputSchema: z.ZodType<Prisma.UserInviteTokenWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserInviteTokenWhereInputSchema),z.lazy(() => UserInviteTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteTokenWhereInputSchema),z.lazy(() => UserInviteTokenWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.UserInviteTokenOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _relevance: z.lazy(() => UserInviteTokenOrderByRelevanceInputSchema).optional()
}).strict();

export const UserInviteTokenWhereUniqueInputSchema: z.ZodType<Prisma.UserInviteTokenWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    token: z.string()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    token: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  token: z.string().optional(),
  AND: z.union([ z.lazy(() => UserInviteTokenWhereInputSchema),z.lazy(() => UserInviteTokenWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteTokenWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteTokenWhereInputSchema),z.lazy(() => UserInviteTokenWhereInputSchema).array() ]).optional(),
  user_email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const UserInviteTokenOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserInviteTokenOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserInviteTokenCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserInviteTokenAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserInviteTokenMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserInviteTokenMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserInviteTokenSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserInviteTokenScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserInviteTokenScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserInviteTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInviteTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserInviteTokenScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserInviteTokenScalarWhereWithAggregatesInputSchema),z.lazy(() => UserInviteTokenScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  user_email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  token: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EntityWhereInputSchema: z.ZodType<Prisma.EntityWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EntityWhereInputSchema),z.lazy(() => EntityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntityWhereInputSchema),z.lazy(() => EntityWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  acronym: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  users: z.lazy(() => UserListRelationFilterSchema).optional()
}).strict();

export const EntityOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.EntityOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  acronym: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
  users: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional(),
  _relevance: z.lazy(() => EntityOrderByRelevanceInputSchema).optional()
}).strict();

export const EntityWhereUniqueInputSchema: z.ZodType<Prisma.EntityWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    name: z.string()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    name: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  AND: z.union([ z.lazy(() => EntityWhereInputSchema),z.lazy(() => EntityWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntityWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntityWhereInputSchema),z.lazy(() => EntityWhereInputSchema).array() ]).optional(),
  acronym: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  products: z.lazy(() => ProductListRelationFilterSchema).optional(),
  users: z.lazy(() => UserListRelationFilterSchema).optional()
}).strict());

export const EntityOrderByWithAggregationInputSchema: z.ZodType<Prisma.EntityOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  acronym: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EntityCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => EntityAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EntityMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EntityMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => EntitySumOrderByAggregateInputSchema).optional()
}).strict();

export const EntityScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EntityScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EntityScalarWhereWithAggregatesInputSchema),z.lazy(() => EntityScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntityScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntityScalarWhereWithAggregatesInputSchema),z.lazy(() => EntityScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  acronym: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ButtonWhereInputSchema: z.ZodType<Prisma.ButtonWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ButtonWhereInputSchema),z.lazy(() => ButtonWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ButtonWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ButtonWhereInputSchema),z.lazy(() => ButtonWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isTest: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional()
}).strict();

export const ButtonOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.ButtonOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isTest: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  _relevance: z.lazy(() => ButtonOrderByRelevanceInputSchema).optional()
}).strict();

export const ButtonWhereUniqueInputSchema: z.ZodType<Prisma.ButtonWhereUniqueInput> = z.object({
  id: z.number()
})
.and(z.object({
  id: z.number().optional(),
  AND: z.union([ z.lazy(() => ButtonWhereInputSchema),z.lazy(() => ButtonWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ButtonWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ButtonWhereInputSchema),z.lazy(() => ButtonWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isTest: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional()
}).strict());

export const ButtonOrderByWithAggregationInputSchema: z.ZodType<Prisma.ButtonOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isTest: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ButtonCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ButtonAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ButtonMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ButtonMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ButtonSumOrderByAggregateInputSchema).optional()
}).strict();

export const ButtonScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ButtonScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ButtonScalarWhereWithAggregatesInputSchema),z.lazy(() => ButtonScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ButtonScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ButtonScalarWhereWithAggregatesInputSchema),z.lazy(() => ButtonScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  isTest: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entity_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isEssential: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  urls: z.lazy(() => StringNullableListFilterSchema).optional(),
  volume: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  observatoire_id: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  entity: z.union([ z.lazy(() => EntityRelationFilterSchema),z.lazy(() => EntityWhereInputSchema) ]).optional(),
  buttons: z.lazy(() => ButtonListRelationFilterSchema).optional(),
  accessRights: z.lazy(() => AccessRightListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional()
}).strict();

export const ProductOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  isEssential: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  urls: z.lazy(() => SortOrderSchema).optional(),
  volume: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  observatoire_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  entity: z.lazy(() => EntityOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  buttons: z.lazy(() => ButtonOrderByRelationAggregateInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightOrderByRelationAggregateInputSchema).optional(),
  favorites: z.lazy(() => FavoriteOrderByRelationAggregateInputSchema).optional(),
  reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
  _relevance: z.lazy(() => ProductOrderByRelevanceInputSchema).optional()
}).strict();

export const ProductWhereUniqueInputSchema: z.ZodType<Prisma.ProductWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    observatoire_id: z.number()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    observatoire_id: z.number(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  observatoire_id: z.number().optional(),
  AND: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductWhereInputSchema),z.lazy(() => ProductWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entity_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isEssential: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  urls: z.lazy(() => StringNullableListFilterSchema).optional(),
  volume: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  entity: z.union([ z.lazy(() => EntityRelationFilterSchema),z.lazy(() => EntityWhereInputSchema) ]).optional(),
  buttons: z.lazy(() => ButtonListRelationFilterSchema).optional(),
  accessRights: z.lazy(() => AccessRightListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoriteListRelationFilterSchema).optional(),
  reviews: z.lazy(() => ReviewListRelationFilterSchema).optional()
}).strict());

export const ProductOrderByWithAggregationInputSchema: z.ZodType<Prisma.ProductOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  isEssential: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  urls: z.lazy(() => SortOrderSchema).optional(),
  volume: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  observatoire_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ProductCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ProductAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ProductMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ProductMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ProductSumOrderByAggregateInputSchema).optional()
}).strict();

export const ProductScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ProductScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema),z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereWithAggregatesInputSchema),z.lazy(() => ProductScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  entity_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  isEssential: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  urls: z.lazy(() => StringNullableListFilterSchema).optional(),
  volume: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  observatoire_id: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
}).strict();

export const AccessRightWhereInputSchema: z.ZodType<Prisma.AccessRightWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccessRightWhereInputSchema),z.lazy(() => AccessRightWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccessRightWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccessRightWhereInputSchema),z.lazy(() => AccessRightWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user_email_invite: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumRightAccessStatusFilterSchema),z.lazy(() => RightAccessStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict();

export const AccessRightOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.AccessRightOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user_email_invite: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  _relevance: z.lazy(() => AccessRightOrderByRelevanceInputSchema).optional()
}).strict();

export const AccessRightWhereUniqueInputSchema: z.ZodType<Prisma.AccessRightWhereUniqueInput> = z.object({
  id: z.number()
})
.and(z.object({
  id: z.number().optional(),
  AND: z.union([ z.lazy(() => AccessRightWhereInputSchema),z.lazy(() => AccessRightWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccessRightWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccessRightWhereInputSchema),z.lazy(() => AccessRightWhereInputSchema).array() ]).optional(),
  user_email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user_email_invite: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumRightAccessStatusFilterSchema),z.lazy(() => RightAccessStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserNullableRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict());

export const AccessRightOrderByWithAggregationInputSchema: z.ZodType<Prisma.AccessRightOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user_email_invite: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AccessRightCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AccessRightAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AccessRightMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AccessRightMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AccessRightSumOrderByAggregateInputSchema).optional()
}).strict();

export const AccessRightScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AccessRightScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AccessRightScalarWhereWithAggregatesInputSchema),z.lazy(() => AccessRightScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccessRightScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccessRightScalarWhereWithAggregatesInputSchema),z.lazy(() => AccessRightScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  user_email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  user_email_invite: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumRightAccessStatusWithAggregatesFilterSchema),z.lazy(() => RightAccessStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const WhiteListedDomainWhereInputSchema: z.ZodType<Prisma.WhiteListedDomainWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WhiteListedDomainWhereInputSchema),z.lazy(() => WhiteListedDomainWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteListedDomainWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteListedDomainWhereInputSchema),z.lazy(() => WhiteListedDomainWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  domain: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.WhiteListedDomainOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  domain: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _relevance: z.lazy(() => WhiteListedDomainOrderByRelevanceInputSchema).optional()
}).strict();

export const WhiteListedDomainWhereUniqueInputSchema: z.ZodType<Prisma.WhiteListedDomainWhereUniqueInput> = z.union([
  z.object({
    id: z.number(),
    domain: z.string()
  }),
  z.object({
    id: z.number(),
  }),
  z.object({
    domain: z.string(),
  }),
])
.and(z.object({
  id: z.number().optional(),
  domain: z.string().optional(),
  AND: z.union([ z.lazy(() => WhiteListedDomainWhereInputSchema),z.lazy(() => WhiteListedDomainWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteListedDomainWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteListedDomainWhereInputSchema),z.lazy(() => WhiteListedDomainWhereInputSchema).array() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const WhiteListedDomainOrderByWithAggregationInputSchema: z.ZodType<Prisma.WhiteListedDomainOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  domain: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => WhiteListedDomainCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => WhiteListedDomainAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => WhiteListedDomainMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => WhiteListedDomainMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => WhiteListedDomainSumOrderByAggregateInputSchema).optional()
}).strict();

export const WhiteListedDomainScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WhiteListedDomainScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => WhiteListedDomainScalarWhereWithAggregatesInputSchema),z.lazy(() => WhiteListedDomainScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => WhiteListedDomainScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WhiteListedDomainScalarWhereWithAggregatesInputSchema),z.lazy(() => WhiteListedDomainScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  domain: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FavoriteWhereInputSchema: z.ZodType<Prisma.FavoriteWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FavoriteWhereInputSchema),z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteWhereInputSchema),z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict();

export const FavoriteOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.FavoriteOrderByWithRelationAndSearchRelevanceInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationAndSearchRelevanceInputSchema).optional()
}).strict();

export const FavoriteWhereUniqueInputSchema: z.ZodType<Prisma.FavoriteWhereUniqueInput> = z.object({
  favorite_id: z.lazy(() => FavoriteFavorite_idCompoundUniqueInputSchema)
})
.and(z.object({
  favorite_id: z.lazy(() => FavoriteFavorite_idCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => FavoriteWhereInputSchema),z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteWhereInputSchema),z.lazy(() => FavoriteWhereInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
}).strict());

export const FavoriteOrderByWithAggregationInputSchema: z.ZodType<Prisma.FavoriteOrderByWithAggregationInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FavoriteCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => FavoriteAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FavoriteMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FavoriteMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => FavoriteSumOrderByAggregateInputSchema).optional()
}).strict();

export const FavoriteScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FavoriteScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema),z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema),z.lazy(() => FavoriteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ReviewWhereInputSchema: z.ZodType<Prisma.ReviewWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  form_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  button_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  button: z.union([ z.lazy(() => ButtonRelationFilterSchema),z.lazy(() => ButtonWhereInputSchema) ]).optional(),
  answers: z.lazy(() => AnswerListRelationFilterSchema).optional()
}).strict();

export const ReviewOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  button: z.lazy(() => ButtonOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  answers: z.lazy(() => AnswerOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ReviewWhereUniqueInputSchema: z.ZodType<Prisma.ReviewWhereUniqueInput> = z.object({
  id: z.number()
})
.and(z.object({
  id: z.number().optional(),
  AND: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewWhereInputSchema),z.lazy(() => ReviewWhereInputSchema).array() ]).optional(),
  form_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  button_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  product: z.union([ z.lazy(() => ProductRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  button: z.union([ z.lazy(() => ButtonRelationFilterSchema),z.lazy(() => ButtonWhereInputSchema) ]).optional(),
  answers: z.lazy(() => AnswerListRelationFilterSchema).optional()
}).strict());

export const ReviewOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReviewCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ReviewAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReviewMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReviewMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ReviewSumOrderByAggregateInputSchema).optional()
}).strict();

export const ReviewScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  form_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  button_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AnswerWhereInputSchema: z.ZodType<Prisma.AnswerWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  field_label: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  field_code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  answer_item_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  answer_text: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  kind: z.union([ z.lazy(() => EnumAnswerKindFilterSchema),z.lazy(() => AnswerKindSchema) ]).optional(),
  review_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  review: z.union([ z.lazy(() => ReviewRelationFilterSchema),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
}).strict();

export const AnswerOrderByWithRelationAndSearchRelevanceInputSchema: z.ZodType<Prisma.AnswerOrderByWithRelationAndSearchRelevanceInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  field_label: z.lazy(() => SortOrderSchema).optional(),
  field_code: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  answer_text: z.lazy(() => SortOrderSchema).optional(),
  kind: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional(),
  review: z.lazy(() => ReviewOrderByWithRelationAndSearchRelevanceInputSchema).optional(),
  _relevance: z.lazy(() => AnswerOrderByRelevanceInputSchema).optional()
}).strict();

export const AnswerWhereUniqueInputSchema: z.ZodType<Prisma.AnswerWhereUniqueInput> = z.object({
  id: z.number()
})
.and(z.object({
  id: z.number().optional(),
  AND: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  field_label: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  field_code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  answer_item_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  answer_text: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  kind: z.union([ z.lazy(() => EnumAnswerKindFilterSchema),z.lazy(() => AnswerKindSchema) ]).optional(),
  review_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  review: z.union([ z.lazy(() => ReviewRelationFilterSchema),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
}).strict());

export const AnswerOrderByWithAggregationInputSchema: z.ZodType<Prisma.AnswerOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  field_label: z.lazy(() => SortOrderSchema).optional(),
  field_code: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  answer_text: z.lazy(() => SortOrderSchema).optional(),
  kind: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AnswerCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AnswerAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AnswerMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AnswerMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AnswerSumOrderByAggregateInputSchema).optional()
}).strict();

export const AnswerScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AnswerScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema),z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema),z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  field_label: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  field_code: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  answer_item_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  answer_text: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  kind: z.union([ z.lazy(() => EnumAnswerKindWithAggregatesFilterSchema),z.lazy(() => AnswerKindSchema) ]).optional(),
  review_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestCreateInputSchema: z.ZodType<Prisma.UserRequestCreateInput> = z.object({
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserRequestsInputSchema).optional()
}).strict();

export const UserRequestUncheckedCreateInputSchema: z.ZodType<Prisma.UserRequestUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  user_id: z.number().optional().nullable(),
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserRequestUpdateInputSchema: z.ZodType<Prisma.UserRequestUpdateInput> = z.object({
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutUserRequestsNestedInputSchema).optional()
}).strict();

export const UserRequestUncheckedUpdateInputSchema: z.ZodType<Prisma.UserRequestUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestCreateManyInputSchema: z.ZodType<Prisma.UserRequestCreateManyInput> = z.object({
  id: z.number().optional(),
  user_id: z.number().optional().nullable(),
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserRequestUpdateManyMutationInputSchema: z.ZodType<Prisma.UserRequestUpdateManyMutationInput> = z.object({
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserRequestUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPCreateInputSchema: z.ZodType<Prisma.UserOTPCreateInput> = z.object({
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserOTPsInputSchema)
}).strict();

export const UserOTPUncheckedCreateInputSchema: z.ZodType<Prisma.UserOTPUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserOTPUpdateInputSchema: z.ZodType<Prisma.UserOTPUpdateInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserOTPsNestedInputSchema).optional()
}).strict();

export const UserOTPUncheckedUpdateInputSchema: z.ZodType<Prisma.UserOTPUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPCreateManyInputSchema: z.ZodType<Prisma.UserOTPCreateManyInput> = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserOTPUpdateManyMutationInputSchema: z.ZodType<Prisma.UserOTPUpdateManyMutationInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserOTPUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenCreateInputSchema: z.ZodType<Prisma.UserValidationTokenCreateInput> = z.object({
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutUserValidationTokensInputSchema)
}).strict();

export const UserValidationTokenUncheckedCreateInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserValidationTokenUpdateInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateInput> = z.object({
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutUserValidationTokensNestedInputSchema).optional()
}).strict();

export const UserValidationTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenCreateManyInputSchema: z.ZodType<Prisma.UserValidationTokenCreateManyInput> = z.object({
  id: z.number().optional(),
  user_id: z.number(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserValidationTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateManyMutationInput> = z.object({
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteTokenCreateInputSchema: z.ZodType<Prisma.UserInviteTokenCreateInput> = z.object({
  user_email: z.string(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserInviteTokenUncheckedCreateInputSchema: z.ZodType<Prisma.UserInviteTokenUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  user_email: z.string(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserInviteTokenUpdateInputSchema: z.ZodType<Prisma.UserInviteTokenUpdateInput> = z.object({
  user_email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteTokenUncheckedUpdateInputSchema: z.ZodType<Prisma.UserInviteTokenUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteTokenCreateManyInputSchema: z.ZodType<Prisma.UserInviteTokenCreateManyInput> = z.object({
  id: z.number().optional(),
  user_email: z.string(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserInviteTokenUpdateManyMutationInputSchema: z.ZodType<Prisma.UserInviteTokenUpdateManyMutationInput> = z.object({
  user_email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserInviteTokenUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserInviteTokenUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntityCreateInputSchema: z.ZodType<Prisma.EntityCreateInput> = z.object({
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutEntityInputSchema).optional(),
  users: z.lazy(() => UserCreateNestedManyWithoutEntitiesInputSchema).optional()
}).strict();

export const EntityUncheckedCreateInputSchema: z.ZodType<Prisma.EntityUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutEntityInputSchema).optional(),
  users: z.lazy(() => UserUncheckedCreateNestedManyWithoutEntitiesInputSchema).optional()
}).strict();

export const EntityUpdateInputSchema: z.ZodType<Prisma.EntityUpdateInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutEntityNestedInputSchema).optional(),
  users: z.lazy(() => UserUpdateManyWithoutEntitiesNestedInputSchema).optional()
}).strict();

export const EntityUncheckedUpdateInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutEntityNestedInputSchema).optional(),
  users: z.lazy(() => UserUncheckedUpdateManyWithoutEntitiesNestedInputSchema).optional()
}).strict();

export const EntityCreateManyInputSchema: z.ZodType<Prisma.EntityCreateManyInput> = z.object({
  id: z.number().optional(),
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const EntityUpdateManyMutationInputSchema: z.ZodType<Prisma.EntityUpdateManyMutationInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntityUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ButtonCreateInputSchema: z.ZodType<Prisma.ButtonCreateInput> = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutButtonsInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutButtonInputSchema).optional()
}).strict();

export const ButtonUncheckedCreateInputSchema: z.ZodType<Prisma.ButtonUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutButtonInputSchema).optional()
}).strict();

export const ButtonUpdateInputSchema: z.ZodType<Prisma.ButtonUpdateInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutButtonsNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutButtonNestedInputSchema).optional()
}).strict();

export const ButtonUncheckedUpdateInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutButtonNestedInputSchema).optional()
}).strict();

export const ButtonCreateManyInputSchema: z.ZodType<Prisma.ButtonCreateManyInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const ButtonUpdateManyMutationInputSchema: z.ZodType<Prisma.ButtonUpdateManyMutationInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ButtonUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProductCreateInputSchema: z.ZodType<Prisma.ProductCreateInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  entity: z.lazy(() => EntityCreateNestedOneWithoutProductsInputSchema),
  buttons: z.lazy(() => ButtonCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUpdateInputSchema: z.ZodType<Prisma.ProductUpdateInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entity: z.lazy(() => EntityUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  buttons: z.lazy(() => ButtonUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable()
}).strict();

export const ProductUpdateManyMutationInputSchema: z.ZodType<Prisma.ProductUpdateManyMutationInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ProductUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AccessRightCreateInputSchema: z.ZodType<Prisma.AccessRightCreateInput> = z.object({
  user_email_invite: z.string().optional().nullable(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAccessRightsInputSchema).optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutAccessRightsInputSchema)
}).strict();

export const AccessRightUncheckedCreateInputSchema: z.ZodType<Prisma.AccessRightUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  user_email: z.string().optional().nullable(),
  user_email_invite: z.string().optional().nullable(),
  product_id: z.number(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightUpdateInputSchema: z.ZodType<Prisma.AccessRightUpdateInput> = z.object({
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutAccessRightsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutAccessRightsNestedInputSchema).optional()
}).strict();

export const AccessRightUncheckedUpdateInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightCreateManyInputSchema: z.ZodType<Prisma.AccessRightCreateManyInput> = z.object({
  id: z.number().optional(),
  user_email: z.string().optional().nullable(),
  user_email_invite: z.string().optional().nullable(),
  product_id: z.number(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightUpdateManyMutationInputSchema: z.ZodType<Prisma.AccessRightUpdateManyMutationInput> = z.object({
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteListedDomainCreateInputSchema: z.ZodType<Prisma.WhiteListedDomainCreateInput> = z.object({
  domain: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const WhiteListedDomainUncheckedCreateInputSchema: z.ZodType<Prisma.WhiteListedDomainUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  domain: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const WhiteListedDomainUpdateInputSchema: z.ZodType<Prisma.WhiteListedDomainUpdateInput> = z.object({
  domain: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteListedDomainUncheckedUpdateInputSchema: z.ZodType<Prisma.WhiteListedDomainUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  domain: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteListedDomainCreateManyInputSchema: z.ZodType<Prisma.WhiteListedDomainCreateManyInput> = z.object({
  id: z.number().optional(),
  domain: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const WhiteListedDomainUpdateManyMutationInputSchema: z.ZodType<Prisma.WhiteListedDomainUpdateManyMutationInput> = z.object({
  domain: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const WhiteListedDomainUncheckedUpdateManyInputSchema: z.ZodType<Prisma.WhiteListedDomainUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  domain: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteCreateInputSchema: z.ZodType<Prisma.FavoriteCreateInput> = z.object({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutFavoritesInputSchema)
}).strict();

export const FavoriteUncheckedCreateInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateInput> = z.object({
  user_id: z.number(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteUpdateInputSchema: z.ZodType<Prisma.FavoriteUpdateInput> = z.object({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional()
}).strict();

export const FavoriteUncheckedUpdateInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateInput> = z.object({
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteCreateManyInputSchema: z.ZodType<Prisma.FavoriteCreateManyInput> = z.object({
  user_id: z.number(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteUpdateManyMutationInputSchema: z.ZodType<Prisma.FavoriteUpdateManyMutationInput> = z.object({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyInput> = z.object({
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewCreateInputSchema: z.ZodType<Prisma.ReviewCreateInput> = z.object({
  form_id: z.number(),
  created_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
  button: z.lazy(() => ButtonCreateNestedOneWithoutReviewsInputSchema),
  answers: z.lazy(() => AnswerCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewUncheckedCreateInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  product_id: z.number(),
  button_id: z.number(),
  created_at: z.coerce.date().optional(),
  answers: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewUpdateInputSchema: z.ZodType<Prisma.ReviewUpdateInput> = z.object({
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  button: z.lazy(() => ButtonUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  answers: z.lazy(() => AnswerUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  button_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  answers: z.lazy(() => AnswerUncheckedUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewCreateManyInputSchema: z.ZodType<Prisma.ReviewCreateManyInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  product_id: z.number(),
  button_id: z.number(),
  created_at: z.coerce.date().optional()
}).strict();

export const ReviewUpdateManyMutationInputSchema: z.ZodType<Prisma.ReviewUpdateManyMutationInput> = z.object({
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  button_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerCreateInputSchema: z.ZodType<Prisma.AnswerCreateInput> = z.object({
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema),
  review: z.lazy(() => ReviewCreateNestedOneWithoutAnswersInputSchema)
}).strict();

export const AnswerUncheckedCreateInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateInput> = z.object({
  id: z.number().optional(),
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema),
  review_id: z.number()
}).strict();

export const AnswerUpdateInputSchema: z.ZodType<Prisma.AnswerUpdateInput> = z.object({
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
  review: z.lazy(() => ReviewUpdateOneRequiredWithoutAnswersNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
  review_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerCreateManyInputSchema: z.ZodType<Prisma.AnswerCreateManyInput> = z.object({
  id: z.number().optional(),
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema),
  review_id: z.number()
}).strict();

export const AnswerUpdateManyMutationInputSchema: z.ZodType<Prisma.AnswerUpdateManyMutationInput> = z.object({
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
  review_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const EnumUserRoleFilterSchema: z.ZodType<Prisma.EnumUserRoleFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const UserOTPListRelationFilterSchema: z.ZodType<Prisma.UserOTPListRelationFilter> = z.object({
  every: z.lazy(() => UserOTPWhereInputSchema).optional(),
  some: z.lazy(() => UserOTPWhereInputSchema).optional(),
  none: z.lazy(() => UserOTPWhereInputSchema).optional()
}).strict();

export const UserValidationTokenListRelationFilterSchema: z.ZodType<Prisma.UserValidationTokenListRelationFilter> = z.object({
  every: z.lazy(() => UserValidationTokenWhereInputSchema).optional(),
  some: z.lazy(() => UserValidationTokenWhereInputSchema).optional(),
  none: z.lazy(() => UserValidationTokenWhereInputSchema).optional()
}).strict();

export const UserRequestListRelationFilterSchema: z.ZodType<Prisma.UserRequestListRelationFilter> = z.object({
  every: z.lazy(() => UserRequestWhereInputSchema).optional(),
  some: z.lazy(() => UserRequestWhereInputSchema).optional(),
  none: z.lazy(() => UserRequestWhereInputSchema).optional()
}).strict();

export const AccessRightListRelationFilterSchema: z.ZodType<Prisma.AccessRightListRelationFilter> = z.object({
  every: z.lazy(() => AccessRightWhereInputSchema).optional(),
  some: z.lazy(() => AccessRightWhereInputSchema).optional(),
  none: z.lazy(() => AccessRightWhereInputSchema).optional()
}).strict();

export const EntityListRelationFilterSchema: z.ZodType<Prisma.EntityListRelationFilter> = z.object({
  every: z.lazy(() => EntityWhereInputSchema).optional(),
  some: z.lazy(() => EntityWhereInputSchema).optional(),
  none: z.lazy(() => EntityWhereInputSchema).optional()
}).strict();

export const FavoriteListRelationFilterSchema: z.ZodType<Prisma.FavoriteListRelationFilter> = z.object({
  every: z.lazy(() => FavoriteWhereInputSchema).optional(),
  some: z.lazy(() => FavoriteWhereInputSchema).optional(),
  none: z.lazy(() => FavoriteWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const UserOTPOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOTPOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRequestOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserRequestOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccessRightOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AccessRightOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntityOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EntityOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FavoriteOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderByRelevanceInputSchema: z.ZodType<Prisma.UserOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => UserOrderByRelevanceFieldEnumSchema),z.lazy(() => UserOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  observatoire_account: z.lazy(() => SortOrderSchema).optional(),
  observatoire_username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  observatoire_account: z.lazy(() => SortOrderSchema).optional(),
  observatoire_username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  active: z.lazy(() => SortOrderSchema).optional(),
  observatoire_account: z.lazy(() => SortOrderSchema).optional(),
  observatoire_username: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumRequestModeFilterSchema: z.ZodType<Prisma.EnumRequestModeFilter> = z.object({
  equals: z.lazy(() => RequestModeSchema).optional(),
  in: z.lazy(() => RequestModeSchema).array().optional(),
  notIn: z.lazy(() => RequestModeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => NestedEnumRequestModeFilterSchema) ]).optional(),
}).strict();

export const EnumUserRequestStatusFilterSchema: z.ZodType<Prisma.EnumUserRequestStatusFilter> = z.object({
  equals: z.lazy(() => UserRequestStatusSchema).optional(),
  in: z.lazy(() => UserRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => UserRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => NestedEnumUserRequestStatusFilterSchema) ]).optional(),
}).strict();

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable()
}).strict();

export const UserRequestOrderByRelevanceInputSchema: z.ZodType<Prisma.UserRequestOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => UserRequestOrderByRelevanceFieldEnumSchema),z.lazy(() => UserRequestOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const UserRequestCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserRequestCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  user_email_copy: z.lazy(() => SortOrderSchema).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  mode: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRequestAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserRequestAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRequestMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserRequestMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  user_email_copy: z.lazy(() => SortOrderSchema).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  mode: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRequestMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserRequestMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  user_email_copy: z.lazy(() => SortOrderSchema).optional(),
  reason: z.lazy(() => SortOrderSchema).optional(),
  mode: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRequestSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserRequestSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const EnumRequestModeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRequestModeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RequestModeSchema).optional(),
  in: z.lazy(() => RequestModeSchema).array().optional(),
  notIn: z.lazy(() => RequestModeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => NestedEnumRequestModeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRequestModeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRequestModeFilterSchema).optional()
}).strict();

export const EnumUserRequestStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserRequestStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRequestStatusSchema).optional(),
  in: z.lazy(() => UserRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => UserRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => NestedEnumUserRequestStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRequestStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRequestStatusFilterSchema).optional()
}).strict();

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserOTPOrderByRelevanceInputSchema: z.ZodType<Prisma.UserOTPOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => UserOTPOrderByRelevanceFieldEnumSchema),z.lazy(() => UserOTPOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const UserOTPCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserOTPCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  expiration_date: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOTPAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserOTPAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOTPMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserOTPMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  expiration_date: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOTPMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserOTPMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  expiration_date: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOTPSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserOTPSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenOrderByRelevanceInputSchema: z.ZodType<Prisma.UserValidationTokenOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => UserValidationTokenOrderByRelevanceFieldEnumSchema),z.lazy(() => UserValidationTokenOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const UserValidationTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserValidationTokenSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserValidationTokenSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteTokenOrderByRelevanceInputSchema: z.ZodType<Prisma.UserInviteTokenOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => UserInviteTokenOrderByRelevanceFieldEnumSchema),z.lazy(() => UserInviteTokenOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const UserInviteTokenCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteTokenCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteTokenAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteTokenAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteTokenMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteTokenMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteTokenMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteTokenMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  token: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserInviteTokenSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserInviteTokenSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductListRelationFilterSchema: z.ZodType<Prisma.ProductListRelationFilter> = z.object({
  every: z.lazy(() => ProductWhereInputSchema).optional(),
  some: z.lazy(() => ProductWhereInputSchema).optional(),
  none: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const UserListRelationFilterSchema: z.ZodType<Prisma.UserListRelationFilter> = z.object({
  every: z.lazy(() => UserWhereInputSchema).optional(),
  some: z.lazy(() => UserWhereInputSchema).optional(),
  none: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const ProductOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntityOrderByRelevanceInputSchema: z.ZodType<Prisma.EntityOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => EntityOrderByRelevanceFieldEnumSchema),z.lazy(() => EntityOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const EntityCountOrderByAggregateInputSchema: z.ZodType<Prisma.EntityCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  acronym: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntityAvgOrderByAggregateInputSchema: z.ZodType<Prisma.EntityAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntityMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EntityMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  acronym: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntityMinOrderByAggregateInputSchema: z.ZodType<Prisma.EntityMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  acronym: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EntitySumOrderByAggregateInputSchema: z.ZodType<Prisma.EntitySumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const ProductNullableRelationFilterSchema: z.ZodType<Prisma.ProductNullableRelationFilter> = z.object({
  is: z.lazy(() => ProductWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional().nullable()
}).strict();

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z.object({
  every: z.lazy(() => ReviewWhereInputSchema).optional(),
  some: z.lazy(() => ReviewWhereInputSchema).optional(),
  none: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export const ReviewOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ReviewOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonOrderByRelevanceInputSchema: z.ZodType<Prisma.ButtonOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => ButtonOrderByRelevanceFieldEnumSchema),z.lazy(() => ButtonOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const ButtonCountOrderByAggregateInputSchema: z.ZodType<Prisma.ButtonCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  isTest: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ButtonAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ButtonMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  isTest: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonMinOrderByAggregateInputSchema: z.ZodType<Prisma.ButtonMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  isTest: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonSumOrderByAggregateInputSchema: z.ZodType<Prisma.ButtonSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const EntityRelationFilterSchema: z.ZodType<Prisma.EntityRelationFilter> = z.object({
  is: z.lazy(() => EntityWhereInputSchema).optional(),
  isNot: z.lazy(() => EntityWhereInputSchema).optional()
}).strict();

export const ButtonListRelationFilterSchema: z.ZodType<Prisma.ButtonListRelationFilter> = z.object({
  every: z.lazy(() => ButtonWhereInputSchema).optional(),
  some: z.lazy(() => ButtonWhereInputSchema).optional(),
  none: z.lazy(() => ButtonWhereInputSchema).optional()
}).strict();

export const ButtonOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ButtonOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductOrderByRelevanceInputSchema: z.ZodType<Prisma.ProductOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => ProductOrderByRelevanceFieldEnumSchema),z.lazy(() => ProductOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const ProductCountOrderByAggregateInputSchema: z.ZodType<Prisma.ProductCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  isEssential: z.lazy(() => SortOrderSchema).optional(),
  urls: z.lazy(() => SortOrderSchema).optional(),
  volume: z.lazy(() => SortOrderSchema).optional(),
  observatoire_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ProductAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  volume: z.lazy(() => SortOrderSchema).optional(),
  observatoire_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  isEssential: z.lazy(() => SortOrderSchema).optional(),
  volume: z.lazy(() => SortOrderSchema).optional(),
  observatoire_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductMinOrderByAggregateInputSchema: z.ZodType<Prisma.ProductMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  isEssential: z.lazy(() => SortOrderSchema).optional(),
  volume: z.lazy(() => SortOrderSchema).optional(),
  observatoire_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ProductSumOrderByAggregateInputSchema: z.ZodType<Prisma.ProductSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  entity_id: z.lazy(() => SortOrderSchema).optional(),
  volume: z.lazy(() => SortOrderSchema).optional(),
  observatoire_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumRightAccessStatusFilterSchema: z.ZodType<Prisma.EnumRightAccessStatusFilter> = z.object({
  equals: z.lazy(() => RightAccessStatusSchema).optional(),
  in: z.lazy(() => RightAccessStatusSchema).array().optional(),
  notIn: z.lazy(() => RightAccessStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => NestedEnumRightAccessStatusFilterSchema) ]).optional(),
}).strict();

export const ProductRelationFilterSchema: z.ZodType<Prisma.ProductRelationFilter> = z.object({
  is: z.lazy(() => ProductWhereInputSchema).optional(),
  isNot: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const AccessRightOrderByRelevanceInputSchema: z.ZodType<Prisma.AccessRightOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => AccessRightOrderByRelevanceFieldEnumSchema),z.lazy(() => AccessRightOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const AccessRightCountOrderByAggregateInputSchema: z.ZodType<Prisma.AccessRightCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  user_email_invite: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccessRightAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AccessRightAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccessRightMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AccessRightMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  user_email_invite: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccessRightMinOrderByAggregateInputSchema: z.ZodType<Prisma.AccessRightMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_email: z.lazy(() => SortOrderSchema).optional(),
  user_email_invite: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AccessRightSumOrderByAggregateInputSchema: z.ZodType<Prisma.AccessRightSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumRightAccessStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRightAccessStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RightAccessStatusSchema).optional(),
  in: z.lazy(() => RightAccessStatusSchema).array().optional(),
  notIn: z.lazy(() => RightAccessStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => NestedEnumRightAccessStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRightAccessStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRightAccessStatusFilterSchema).optional()
}).strict();

export const WhiteListedDomainOrderByRelevanceInputSchema: z.ZodType<Prisma.WhiteListedDomainOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => WhiteListedDomainOrderByRelevanceFieldEnumSchema),z.lazy(() => WhiteListedDomainOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const WhiteListedDomainCountOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteListedDomainCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  domain: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteListedDomainAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteListedDomainAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteListedDomainMaxOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteListedDomainMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  domain: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteListedDomainMinOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteListedDomainMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  domain: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const WhiteListedDomainSumOrderByAggregateInputSchema: z.ZodType<Prisma.WhiteListedDomainSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteFavorite_idCompoundUniqueInputSchema: z.ZodType<Prisma.FavoriteFavorite_idCompoundUniqueInput> = z.object({
  user_id: z.number(),
  product_id: z.number()
}).strict();

export const FavoriteCountOrderByAggregateInputSchema: z.ZodType<Prisma.FavoriteCountOrderByAggregateInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteAvgOrderByAggregateInputSchema: z.ZodType<Prisma.FavoriteAvgOrderByAggregateInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FavoriteMaxOrderByAggregateInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteMinOrderByAggregateInputSchema: z.ZodType<Prisma.FavoriteMinOrderByAggregateInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FavoriteSumOrderByAggregateInputSchema: z.ZodType<Prisma.FavoriteSumOrderByAggregateInput> = z.object({
  user_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ButtonRelationFilterSchema: z.ZodType<Prisma.ButtonRelationFilter> = z.object({
  is: z.lazy(() => ButtonWhereInputSchema).optional(),
  isNot: z.lazy(() => ButtonWhereInputSchema).optional()
}).strict();

export const AnswerListRelationFilterSchema: z.ZodType<Prisma.AnswerListRelationFilter> = z.object({
  every: z.lazy(() => AnswerWhereInputSchema).optional(),
  some: z.lazy(() => AnswerWhereInputSchema).optional(),
  none: z.lazy(() => AnswerWhereInputSchema).optional()
}).strict();

export const AnswerOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AnswerOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ReviewSumOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  form_id: z.lazy(() => SortOrderSchema).optional(),
  product_id: z.lazy(() => SortOrderSchema).optional(),
  button_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumAnswerKindFilterSchema: z.ZodType<Prisma.EnumAnswerKindFilter> = z.object({
  equals: z.lazy(() => AnswerKindSchema).optional(),
  in: z.lazy(() => AnswerKindSchema).array().optional(),
  notIn: z.lazy(() => AnswerKindSchema).array().optional(),
  not: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => NestedEnumAnswerKindFilterSchema) ]).optional(),
}).strict();

export const ReviewRelationFilterSchema: z.ZodType<Prisma.ReviewRelationFilter> = z.object({
  is: z.lazy(() => ReviewWhereInputSchema).optional(),
  isNot: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export const AnswerOrderByRelevanceInputSchema: z.ZodType<Prisma.AnswerOrderByRelevanceInput> = z.object({
  fields: z.union([ z.lazy(() => AnswerOrderByRelevanceFieldEnumSchema),z.lazy(() => AnswerOrderByRelevanceFieldEnumSchema).array() ]),
  sort: z.lazy(() => SortOrderSchema),
  search: z.string()
}).strict();

export const AnswerCountOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  field_label: z.lazy(() => SortOrderSchema).optional(),
  field_code: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  answer_text: z.lazy(() => SortOrderSchema).optional(),
  kind: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  field_label: z.lazy(() => SortOrderSchema).optional(),
  field_code: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  answer_text: z.lazy(() => SortOrderSchema).optional(),
  kind: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerMinOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  field_label: z.lazy(() => SortOrderSchema).optional(),
  field_code: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  answer_text: z.lazy(() => SortOrderSchema).optional(),
  kind: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerSumOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  answer_item_id: z.lazy(() => SortOrderSchema).optional(),
  review_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumAnswerKindWithAggregatesFilterSchema: z.ZodType<Prisma.EnumAnswerKindWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AnswerKindSchema).optional(),
  in: z.lazy(() => AnswerKindSchema).array().optional(),
  notIn: z.lazy(() => AnswerKindSchema).array().optional(),
  not: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => NestedEnumAnswerKindWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAnswerKindFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAnswerKindFilterSchema).optional()
}).strict();

export const UserOTPCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserOTPCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPCreateWithoutUserInputSchema).array(),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOTPCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserValidationTokenCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserValidationTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRequestCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRequestCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestCreateWithoutUserInputSchema).array(),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRequestCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccessRightCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccessRightCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightCreateWithoutUserInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EntityCreateNestedManyWithoutUsersInputSchema: z.ZodType<Prisma.EntityCreateNestedManyWithoutUsersInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityCreateWithoutUsersInputSchema).array(),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema),z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FavoriteCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserOTPUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPCreateWithoutUserInputSchema).array(),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOTPCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserValidationTokenCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRequestUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestCreateWithoutUserInputSchema).array(),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRequestCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightCreateWithoutUserInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EntityUncheckedCreateNestedManyWithoutUsersInputSchema: z.ZodType<Prisma.EntityUncheckedCreateNestedManyWithoutUsersInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityCreateWithoutUsersInputSchema).array(),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema),z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const EnumUserRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => UserRoleSchema).optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const UserOTPUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserOTPUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPCreateWithoutUserInputSchema).array(),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOTPUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOTPUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOTPCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOTPUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOTPUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOTPUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserOTPUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOTPScalarWhereInputSchema),z.lazy(() => UserOTPScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserValidationTokenUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserValidationTokenUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserValidationTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserValidationTokenUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserValidationTokenUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserValidationTokenScalarWhereInputSchema),z.lazy(() => UserValidationTokenScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRequestUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRequestUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestCreateWithoutUserInputSchema).array(),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRequestUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRequestUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRequestCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRequestUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRequestUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRequestUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRequestUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRequestScalarWhereInputSchema),z.lazy(() => UserRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccessRightUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightCreateWithoutUserInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccessRightUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccessRightUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EntityUpdateManyWithoutUsersNestedInputSchema: z.ZodType<Prisma.EntityUpdateManyWithoutUsersNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityCreateWithoutUsersInputSchema).array(),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema),z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntityUpsertWithWhereUniqueWithoutUsersInputSchema),z.lazy(() => EntityUpsertWithWhereUniqueWithoutUsersInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntityUpdateWithWhereUniqueWithoutUsersInputSchema),z.lazy(() => EntityUpdateWithWhereUniqueWithoutUsersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntityUpdateManyWithWhereWithoutUsersInputSchema),z.lazy(() => EntityUpdateManyWithWhereWithoutUsersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntityScalarWhereInputSchema),z.lazy(() => EntityScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserOTPUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPCreateWithoutUserInputSchema).array(),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserOTPCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserOTPUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOTPUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserOTPCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserOTPWhereUniqueInputSchema),z.lazy(() => UserOTPWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserOTPUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserOTPUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserOTPUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserOTPUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserOTPScalarWhereInputSchema),z.lazy(() => UserOTPScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema).array(),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserValidationTokenCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserValidationTokenUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserValidationTokenCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserValidationTokenWhereUniqueInputSchema),z.lazy(() => UserValidationTokenWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserValidationTokenUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserValidationTokenUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserValidationTokenUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserValidationTokenScalarWhereInputSchema),z.lazy(() => UserValidationTokenScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRequestUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestCreateWithoutUserInputSchema).array(),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRequestCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRequestUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRequestUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRequestCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRequestWhereUniqueInputSchema),z.lazy(() => UserRequestWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRequestUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRequestUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRequestUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRequestUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRequestScalarWhereInputSchema),z.lazy(() => UserRequestScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightCreateWithoutUserInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccessRightUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => AccessRightUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EntityUncheckedUpdateManyWithoutUsersNestedInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateManyWithoutUsersNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityCreateWithoutUsersInputSchema).array(),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema),z.lazy(() => EntityCreateOrConnectWithoutUsersInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EntityUpsertWithWhereUniqueWithoutUsersInputSchema),z.lazy(() => EntityUpsertWithWhereUniqueWithoutUsersInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EntityWhereUniqueInputSchema),z.lazy(() => EntityWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EntityUpdateWithWhereUniqueWithoutUsersInputSchema),z.lazy(() => EntityUpdateWithWhereUniqueWithoutUsersInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EntityUpdateManyWithWhereWithoutUsersInputSchema),z.lazy(() => EntityUpdateManyWithWhereWithoutUsersInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EntityScalarWhereInputSchema),z.lazy(() => EntityScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteCreateWithoutUserInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => FavoriteUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserRequestsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserRequestsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserRequestsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumRequestModeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRequestModeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RequestModeSchema).optional()
}).strict();

export const EnumUserRequestStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserRequestStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => UserRequestStatusSchema).optional()
}).strict();

export const UserUpdateOneWithoutUserRequestsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutUserRequestsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserRequestsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserRequestsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserRequestsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserRequestsInputSchema),z.lazy(() => UserUpdateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserRequestsInputSchema) ]).optional(),
}).strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserCreateNestedOneWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserOTPsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOTPsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserOTPsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutUserOTPsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserOTPsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOTPsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserOTPsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserOTPsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserOTPsInputSchema),z.lazy(() => UserUpdateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOTPsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserValidationTokensInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserValidationTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserValidationTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutUserValidationTokensNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserValidationTokensNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserValidationTokensInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserValidationTokensInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserValidationTokensInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserValidationTokensInputSchema),z.lazy(() => UserUpdateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserValidationTokensInputSchema) ]).optional(),
}).strict();

export const ProductCreateNestedManyWithoutEntityInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutEntityInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductCreateWithoutEntityInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema),z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyEntityInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedManyWithoutEntitiesInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutEntitiesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserCreateWithoutEntitiesInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema),z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProductUncheckedCreateNestedManyWithoutEntityInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutEntityInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductCreateWithoutEntityInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema),z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyEntityInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedCreateNestedManyWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutEntitiesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserCreateWithoutEntitiesInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema),z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProductUpdateManyWithoutEntityNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutEntityNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductCreateWithoutEntityInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema),z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutEntityInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutEntityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyEntityInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutEntityInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutEntityInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutEntityInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutEntityInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUpdateManyWithoutEntitiesNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutEntitiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserCreateWithoutEntitiesInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema),z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutEntitiesInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutEntitiesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutEntitiesInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutEntitiesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutEntitiesInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutEntitiesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProductUncheckedUpdateManyWithoutEntityNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutEntityNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductCreateWithoutEntityInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema),z.lazy(() => ProductCreateOrConnectWithoutEntityInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutEntityInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutEntityInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductCreateManyEntityInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutEntityInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutEntityInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutEntityInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutEntityInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedUpdateManyWithoutEntitiesNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutEntitiesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserCreateWithoutEntitiesInputSchema).array(),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema),z.lazy(() => UserCreateOrConnectWithoutEntitiesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutEntitiesInputSchema),z.lazy(() => UserUpsertWithWhereUniqueWithoutEntitiesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema),z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutEntitiesInputSchema),z.lazy(() => UserUpdateWithWhereUniqueWithoutEntitiesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutEntitiesInputSchema),z.lazy(() => UserUpdateManyWithWhereWithoutEntitiesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProductCreateNestedOneWithoutButtonsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutButtonsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutButtonsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutButtonsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export const ReviewCreateNestedManyWithoutButtonInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutButtonInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewCreateWithoutButtonInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyButtonInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedCreateNestedManyWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutButtonInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewCreateWithoutButtonInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyButtonInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict();

export const ProductUpdateOneWithoutButtonsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutButtonsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutButtonsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutButtonsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutButtonsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutButtonsInputSchema),z.lazy(() => ProductUpdateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutButtonsInputSchema) ]).optional(),
}).strict();

export const ReviewUpdateManyWithoutButtonNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutButtonNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewCreateWithoutButtonInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutButtonInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutButtonInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyButtonInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutButtonInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutButtonInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutButtonInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutButtonInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutButtonNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutButtonNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewCreateWithoutButtonInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutButtonInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutButtonInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutButtonInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyButtonInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutButtonInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutButtonInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutButtonInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutButtonInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ProductCreateurlsInputSchema: z.ZodType<Prisma.ProductCreateurlsInput> = z.object({
  set: z.string().array()
}).strict();

export const EntityCreateNestedOneWithoutProductsInputSchema: z.ZodType<Prisma.EntityCreateNestedOneWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EntityCreateOrConnectWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => EntityWhereUniqueInputSchema).optional()
}).strict();

export const ButtonCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ButtonCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonCreateWithoutProductInputSchema).array(),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema),z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ButtonCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccessRightCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.AccessRightCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightCreateWithoutProductInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FavoriteCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.FavoriteCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteCreateWithoutProductInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewCreateWithoutProductInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ButtonUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ButtonUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonCreateWithoutProductInputSchema).array(),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema),z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ButtonCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightCreateWithoutProductInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteCreateWithoutProductInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewCreateWithoutProductInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProductUpdateurlsInputSchema: z.ZodType<Prisma.ProductUpdateurlsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const EntityUpdateOneRequiredWithoutProductsNestedInputSchema: z.ZodType<Prisma.EntityUpdateOneRequiredWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => EntityCreateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedCreateWithoutProductsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => EntityCreateOrConnectWithoutProductsInputSchema).optional(),
  upsert: z.lazy(() => EntityUpsertWithoutProductsInputSchema).optional(),
  connect: z.lazy(() => EntityWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => EntityUpdateToOneWithWhereWithoutProductsInputSchema),z.lazy(() => EntityUpdateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedUpdateWithoutProductsInputSchema) ]).optional(),
}).strict();

export const ButtonUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ButtonUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonCreateWithoutProductInputSchema).array(),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema),z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ButtonUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ButtonUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ButtonCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ButtonUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ButtonUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ButtonUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => ButtonUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ButtonScalarWhereInputSchema),z.lazy(() => ButtonScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.AccessRightUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightCreateWithoutProductInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccessRightUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => AccessRightUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteCreateWithoutProductInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => FavoriteUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewCreateWithoutProductInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ButtonUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonCreateWithoutProductInputSchema).array(),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema),z.lazy(() => ButtonCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ButtonUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ButtonUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ButtonCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ButtonWhereUniqueInputSchema),z.lazy(() => ButtonWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ButtonUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ButtonUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ButtonUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => ButtonUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ButtonScalarWhereInputSchema),z.lazy(() => ButtonScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightCreateWithoutProductInputSchema).array(),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema),z.lazy(() => AccessRightCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => AccessRightUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AccessRightCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AccessRightWhereUniqueInputSchema),z.lazy(() => AccessRightWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => AccessRightUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AccessRightUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => AccessRightUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteCreateWithoutProductInputSchema).array(),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema),z.lazy(() => FavoriteCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => FavoriteUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema),z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => FavoriteUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoriteUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => FavoriteUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewCreateWithoutProductInputSchema).array(),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema),z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ReviewWhereUniqueInputSchema),z.lazy(() => ReviewWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema),z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema),z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutAccessRightsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccessRightsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccessRightsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProductCreateNestedOneWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutAccessRightsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutAccessRightsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutAccessRightsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export const EnumRightAccessStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRightAccessStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RightAccessStatusSchema).optional()
}).strict();

export const UserUpdateOneWithoutAccessRightsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutAccessRightsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccessRightsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAccessRightsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAccessRightsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAccessRightsInputSchema),z.lazy(() => UserUpdateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccessRightsInputSchema) ]).optional(),
}).strict();

export const ProductUpdateOneRequiredWithoutAccessRightsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutAccessRightsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutAccessRightsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutAccessRightsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutAccessRightsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutAccessRightsInputSchema),z.lazy(() => ProductUpdateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutAccessRightsInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutFavoritesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ProductCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutFavoritesInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutFavoritesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutFavoritesInputSchema),z.lazy(() => UserUpdateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
}).strict();

export const ProductUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutFavoritesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutFavoritesInputSchema),z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
}).strict();

export const ProductCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export const ButtonCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonCreateNestedOneWithoutReviewsInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ButtonCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ButtonWhereUniqueInputSchema).optional()
}).strict();

export const AnswerCreateNestedManyWithoutReviewInputSchema: z.ZodType<Prisma.AnswerCreateNestedManyWithoutReviewInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerCreateWithoutReviewInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyReviewInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedCreateNestedManyWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateNestedManyWithoutReviewInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerCreateWithoutReviewInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyReviewInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ProductUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneRequiredWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => ProductUpdateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export const ButtonUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.ButtonUpdateOneRequiredWithoutReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ButtonCreateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ButtonCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => ButtonUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => ButtonWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ButtonUpdateToOneWithWhereWithoutReviewsInputSchema),z.lazy(() => ButtonUpdateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
}).strict();

export const AnswerUpdateManyWithoutReviewNestedInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithoutReviewNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerCreateWithoutReviewInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyReviewInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutReviewInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutReviewInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyWithoutReviewNestedInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutReviewNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerCreateWithoutReviewInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyReviewInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutReviewInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutReviewInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutReviewInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutReviewInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ReviewCreateNestedOneWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewCreateNestedOneWithoutAnswersInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutAnswersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutAnswersInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional()
}).strict();

export const EnumAnswerKindFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAnswerKindFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AnswerKindSchema).optional()
}).strict();

export const ReviewUpdateOneRequiredWithoutAnswersNestedInputSchema: z.ZodType<Prisma.ReviewUpdateOneRequiredWithoutAnswersNestedInput> = z.object({
  create: z.union([ z.lazy(() => ReviewCreateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutAnswersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ReviewCreateOrConnectWithoutAnswersInputSchema).optional(),
  upsert: z.lazy(() => ReviewUpsertWithoutAnswersInputSchema).optional(),
  connect: z.lazy(() => ReviewWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ReviewUpdateToOneWithWhereWithoutAnswersInputSchema),z.lazy(() => ReviewUpdateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutAnswersInputSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedEnumUserRoleFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  search: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedEnumUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRoleSchema).optional(),
  in: z.lazy(() => UserRoleSchema).array().optional(),
  notIn: z.lazy(() => UserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => NestedEnumUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRoleFilterSchema).optional()
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedEnumRequestModeFilterSchema: z.ZodType<Prisma.NestedEnumRequestModeFilter> = z.object({
  equals: z.lazy(() => RequestModeSchema).optional(),
  in: z.lazy(() => RequestModeSchema).array().optional(),
  notIn: z.lazy(() => RequestModeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => NestedEnumRequestModeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumUserRequestStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserRequestStatusFilter> = z.object({
  equals: z.lazy(() => UserRequestStatusSchema).optional(),
  in: z.lazy(() => UserRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => UserRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => NestedEnumUserRequestStatusFilterSchema) ]).optional(),
}).strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumRequestModeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRequestModeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RequestModeSchema).optional(),
  in: z.lazy(() => RequestModeSchema).array().optional(),
  notIn: z.lazy(() => RequestModeSchema).array().optional(),
  not: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => NestedEnumRequestModeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRequestModeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRequestModeFilterSchema).optional()
}).strict();

export const NestedEnumUserRequestStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserRequestStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => UserRequestStatusSchema).optional(),
  in: z.lazy(() => UserRequestStatusSchema).array().optional(),
  notIn: z.lazy(() => UserRequestStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => NestedEnumUserRequestStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserRequestStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserRequestStatusFilterSchema).optional()
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const NestedEnumRightAccessStatusFilterSchema: z.ZodType<Prisma.NestedEnumRightAccessStatusFilter> = z.object({
  equals: z.lazy(() => RightAccessStatusSchema).optional(),
  in: z.lazy(() => RightAccessStatusSchema).array().optional(),
  notIn: z.lazy(() => RightAccessStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => NestedEnumRightAccessStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRightAccessStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRightAccessStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RightAccessStatusSchema).optional(),
  in: z.lazy(() => RightAccessStatusSchema).array().optional(),
  notIn: z.lazy(() => RightAccessStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => NestedEnumRightAccessStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRightAccessStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRightAccessStatusFilterSchema).optional()
}).strict();

export const NestedEnumAnswerKindFilterSchema: z.ZodType<Prisma.NestedEnumAnswerKindFilter> = z.object({
  equals: z.lazy(() => AnswerKindSchema).optional(),
  in: z.lazy(() => AnswerKindSchema).array().optional(),
  notIn: z.lazy(() => AnswerKindSchema).array().optional(),
  not: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => NestedEnumAnswerKindFilterSchema) ]).optional(),
}).strict();

export const NestedEnumAnswerKindWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAnswerKindWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AnswerKindSchema).optional(),
  in: z.lazy(() => AnswerKindSchema).array().optional(),
  notIn: z.lazy(() => AnswerKindSchema).array().optional(),
  not: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => NestedEnumAnswerKindWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAnswerKindFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAnswerKindFilterSchema).optional()
}).strict();

export const UserOTPCreateWithoutUserInputSchema: z.ZodType<Prisma.UserOTPCreateWithoutUserInput> = z.object({
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserOTPUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().optional(),
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserOTPCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserOTPCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserOTPWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserOTPCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserOTPCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserOTPCreateManyUserInputSchema),z.lazy(() => UserOTPCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserValidationTokenCreateWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenCreateWithoutUserInput> = z.object({
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserValidationTokenUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().optional(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserValidationTokenCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserValidationTokenWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserValidationTokenCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserValidationTokenCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserValidationTokenCreateManyUserInputSchema),z.lazy(() => UserValidationTokenCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserRequestCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRequestCreateWithoutUserInput> = z.object({
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserRequestUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().optional(),
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserRequestCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserRequestCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserRequestWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRequestCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserRequestCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserRequestCreateManyUserInputSchema),z.lazy(() => UserRequestCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AccessRightCreateWithoutUserInputSchema: z.ZodType<Prisma.AccessRightCreateWithoutUserInput> = z.object({
  user_email_invite: z.string().optional().nullable(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutAccessRightsInputSchema)
}).strict();

export const AccessRightUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().optional(),
  user_email_invite: z.string().optional().nullable(),
  product_id: z.number(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.AccessRightCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccessRightCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AccessRightCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AccessRightCreateManyUserInputSchema),z.lazy(() => AccessRightCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EntityCreateWithoutUsersInputSchema: z.ZodType<Prisma.EntityCreateWithoutUsersInput> = z.object({
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  products: z.lazy(() => ProductCreateNestedManyWithoutEntityInputSchema).optional()
}).strict();

export const EntityUncheckedCreateWithoutUsersInputSchema: z.ZodType<Prisma.EntityUncheckedCreateWithoutUsersInput> = z.object({
  id: z.number().optional(),
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  products: z.lazy(() => ProductUncheckedCreateNestedManyWithoutEntityInputSchema).optional()
}).strict();

export const EntityCreateOrConnectWithoutUsersInputSchema: z.ZodType<Prisma.EntityCreateOrConnectWithoutUsersInput> = z.object({
  where: z.lazy(() => EntityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema) ]),
}).strict();

export const FavoriteCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateWithoutUserInput> = z.object({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutFavoritesInputSchema)
}).strict();

export const FavoriteUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateWithoutUserInput> = z.object({
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.FavoriteCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const FavoriteCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.FavoriteCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FavoriteCreateManyUserInputSchema),z.lazy(() => FavoriteCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserOTPUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserOTPWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserOTPUpdateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserOTPCreateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserOTPUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserOTPWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserOTPUpdateWithoutUserInputSchema),z.lazy(() => UserOTPUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserOTPUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserOTPScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserOTPUpdateManyMutationInputSchema),z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserOTPScalarWhereInputSchema: z.ZodType<Prisma.UserOTPScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserOTPScalarWhereInputSchema),z.lazy(() => UserOTPScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserOTPScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserOTPScalarWhereInputSchema),z.lazy(() => UserOTPScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiration_date: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserValidationTokenUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserValidationTokenWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserValidationTokenUpdateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserValidationTokenCreateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserValidationTokenUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserValidationTokenWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserValidationTokenUpdateWithoutUserInputSchema),z.lazy(() => UserValidationTokenUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserValidationTokenUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserValidationTokenScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserValidationTokenUpdateManyMutationInputSchema),z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserValidationTokenScalarWhereInputSchema: z.ZodType<Prisma.UserValidationTokenScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserValidationTokenScalarWhereInputSchema),z.lazy(() => UserValidationTokenScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserValidationTokenScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserValidationTokenScalarWhereInputSchema),z.lazy(() => UserValidationTokenScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  token: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserRequestUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRequestWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserRequestUpdateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserRequestCreateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRequestUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRequestWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserRequestUpdateWithoutUserInputSchema),z.lazy(() => UserRequestUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserRequestUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserRequestScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserRequestUpdateManyMutationInputSchema),z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserRequestScalarWhereInputSchema: z.ZodType<Prisma.UserRequestScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRequestScalarWhereInputSchema),z.lazy(() => UserRequestScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRequestScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRequestScalarWhereInputSchema),z.lazy(() => UserRequestScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  user_email_copy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  reason: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  mode: z.union([ z.lazy(() => EnumRequestModeFilterSchema),z.lazy(() => RequestModeSchema) ]).optional(),
  status: z.union([ z.lazy(() => EnumUserRequestStatusFilterSchema),z.lazy(() => UserRequestStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AccessRightUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AccessRightUpdateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => AccessRightCreateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const AccessRightUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AccessRightUpdateWithoutUserInputSchema),z.lazy(() => AccessRightUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const AccessRightUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => AccessRightScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AccessRightUpdateManyMutationInputSchema),z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const AccessRightScalarWhereInputSchema: z.ZodType<Prisma.AccessRightScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AccessRightScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AccessRightScalarWhereInputSchema),z.lazy(() => AccessRightScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  user_email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user_email_invite: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumRightAccessStatusFilterSchema),z.lazy(() => RightAccessStatusSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EntityUpsertWithWhereUniqueWithoutUsersInputSchema: z.ZodType<Prisma.EntityUpsertWithWhereUniqueWithoutUsersInput> = z.object({
  where: z.lazy(() => EntityWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EntityUpdateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedUpdateWithoutUsersInputSchema) ]),
  create: z.union([ z.lazy(() => EntityCreateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedCreateWithoutUsersInputSchema) ]),
}).strict();

export const EntityUpdateWithWhereUniqueWithoutUsersInputSchema: z.ZodType<Prisma.EntityUpdateWithWhereUniqueWithoutUsersInput> = z.object({
  where: z.lazy(() => EntityWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EntityUpdateWithoutUsersInputSchema),z.lazy(() => EntityUncheckedUpdateWithoutUsersInputSchema) ]),
}).strict();

export const EntityUpdateManyWithWhereWithoutUsersInputSchema: z.ZodType<Prisma.EntityUpdateManyWithWhereWithoutUsersInput> = z.object({
  where: z.lazy(() => EntityScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EntityUpdateManyMutationInputSchema),z.lazy(() => EntityUncheckedUpdateManyWithoutUsersInputSchema) ]),
}).strict();

export const EntityScalarWhereInputSchema: z.ZodType<Prisma.EntityScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EntityScalarWhereInputSchema),z.lazy(() => EntityScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EntityScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EntityScalarWhereInputSchema),z.lazy(() => EntityScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  acronym: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const FavoriteUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteUpdateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const FavoriteUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateWithoutUserInputSchema),z.lazy(() => FavoriteUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const FavoriteUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => FavoriteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateManyMutationInputSchema),z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const FavoriteScalarWhereInputSchema: z.ZodType<Prisma.FavoriteScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteScalarWhereInputSchema),z.lazy(() => FavoriteScalarWhereInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserCreateWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserCreateWithoutUserRequestsInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserRequestsInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserRequestsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserRequestsInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserRequestsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserRequestsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserRequestsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserRequestsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserRequestsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserRequestsInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserRequestsInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserRequestsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserRequestsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserCreateWithoutUserOTPsInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserOTPsInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserOTPsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOTPsInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserOTPsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOTPsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserOTPsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserOTPsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserOTPsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserOTPsInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserOTPsInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserOTPsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserOTPsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserCreateWithoutUserValidationTokensInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserValidationTokensInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserValidationTokensInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserValidationTokensInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserValidationTokensInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserValidationTokensInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserValidationTokensInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserValidationTokensInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserValidationTokensInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserValidationTokensInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserValidationTokensInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserValidationTokensInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserValidationTokensInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ProductCreateWithoutEntityInputSchema: z.ZodType<Prisma.ProductCreateWithoutEntityInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateWithoutEntityInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutEntityInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductCreateOrConnectWithoutEntityInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutEntityInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema) ]),
}).strict();

export const ProductCreateManyEntityInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyEntityInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProductCreateManyEntityInputSchema),z.lazy(() => ProductCreateManyEntityInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserCreateWithoutEntitiesInputSchema: z.ZodType<Prisma.UserCreateWithoutEntitiesInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEntitiesInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutEntitiesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEntitiesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema) ]),
}).strict();

export const ProductUpsertWithWhereUniqueWithoutEntityInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutEntityInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutEntityInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedCreateWithoutEntityInputSchema) ]),
}).strict();

export const ProductUpdateWithWhereUniqueWithoutEntityInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutEntityInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutEntityInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutEntityInputSchema) ]),
}).strict();

export const ProductUpdateManyWithWhereWithoutEntityInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutEntityInput> = z.object({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema),z.lazy(() => ProductUncheckedUpdateManyWithoutEntityInputSchema) ]),
}).strict();

export const ProductScalarWhereInputSchema: z.ZodType<Prisma.ProductScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ProductScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  entity_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isEssential: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  urls: z.lazy(() => StringNullableListFilterSchema).optional(),
  volume: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
  observatoire_id: z.union([ z.lazy(() => IntNullableFilterSchema),z.number() ]).optional().nullable(),
}).strict();

export const UserUpsertWithWhereUniqueWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutEntitiesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEntitiesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEntitiesInputSchema) ]),
}).strict();

export const UserUpdateWithWhereUniqueWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutEntitiesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutEntitiesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEntitiesInputSchema) ]),
}).strict();

export const UserUpdateManyWithWhereWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutEntitiesInput> = z.object({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema),z.lazy(() => UserUncheckedUpdateManyWithoutEntitiesInputSchema) ]),
}).strict();

export const UserScalarWhereInputSchema: z.ZodType<Prisma.UserScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereInputSchema),z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  active: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_account: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  observatoire_username: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  email: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => EnumUserRoleFilterSchema),z.lazy(() => UserRoleSchema) ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const ProductCreateWithoutButtonsInputSchema: z.ZodType<Prisma.ProductCreateWithoutButtonsInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  entity: z.lazy(() => EntityCreateNestedOneWithoutProductsInputSchema),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateWithoutButtonsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutButtonsInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductCreateOrConnectWithoutButtonsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutButtonsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutButtonsInputSchema) ]),
}).strict();

export const ReviewCreateWithoutButtonInputSchema: z.ZodType<Prisma.ReviewCreateWithoutButtonInput> = z.object({
  form_id: z.number(),
  created_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
  answers: z.lazy(() => AnswerCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewUncheckedCreateWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutButtonInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  answers: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewCreateOrConnectWithoutButtonInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutButtonInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema) ]),
}).strict();

export const ReviewCreateManyButtonInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyButtonInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyButtonInputSchema),z.lazy(() => ReviewCreateManyButtonInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProductUpsertWithoutButtonsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutButtonsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutButtonsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutButtonsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const ProductUpdateToOneWithWhereWithoutButtonsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutButtonsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutButtonsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutButtonsInputSchema) ]),
}).strict();

export const ProductUpdateWithoutButtonsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutButtonsInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entity: z.lazy(() => EntityUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateWithoutButtonsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutButtonsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ReviewUpsertWithWhereUniqueWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutButtonInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutButtonInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutButtonInputSchema) ]),
}).strict();

export const ReviewUpdateWithWhereUniqueWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutButtonInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutButtonInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutButtonInputSchema) ]),
}).strict();

export const ReviewUpdateManyWithWhereWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutButtonInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutButtonInputSchema) ]),
}).strict();

export const ReviewScalarWhereInputSchema: z.ZodType<Prisma.ReviewScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewScalarWhereInputSchema),z.lazy(() => ReviewScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  form_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  button_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EntityCreateWithoutProductsInputSchema: z.ZodType<Prisma.EntityCreateWithoutProductsInput> = z.object({
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  users: z.lazy(() => UserCreateNestedManyWithoutEntitiesInputSchema).optional()
}).strict();

export const EntityUncheckedCreateWithoutProductsInputSchema: z.ZodType<Prisma.EntityUncheckedCreateWithoutProductsInput> = z.object({
  id: z.number().optional(),
  name: z.string(),
  acronym: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  users: z.lazy(() => UserUncheckedCreateNestedManyWithoutEntitiesInputSchema).optional()
}).strict();

export const EntityCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.EntityCreateOrConnectWithoutProductsInput> = z.object({
  where: z.lazy(() => EntityWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EntityCreateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export const ButtonCreateWithoutProductInputSchema: z.ZodType<Prisma.ButtonCreateWithoutProductInput> = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutButtonInputSchema).optional()
}).strict();

export const ButtonUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ButtonUncheckedCreateWithoutProductInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutButtonInputSchema).optional()
}).strict();

export const ButtonCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ButtonCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => ButtonWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const ButtonCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ButtonCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ButtonCreateManyProductInputSchema),z.lazy(() => ButtonCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AccessRightCreateWithoutProductInputSchema: z.ZodType<Prisma.AccessRightCreateWithoutProductInput> = z.object({
  user_email_invite: z.string().optional().nullable(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutAccessRightsInputSchema).optional()
}).strict();

export const AccessRightUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUncheckedCreateWithoutProductInput> = z.object({
  id: z.number().optional(),
  user_email: z.string().optional().nullable(),
  user_email_invite: z.string().optional().nullable(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.AccessRightCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const AccessRightCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.AccessRightCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AccessRightCreateManyProductInputSchema),z.lazy(() => AccessRightCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const FavoriteCreateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteCreateWithoutProductInput> = z.object({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutFavoritesInputSchema)
}).strict();

export const FavoriteUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateWithoutProductInput> = z.object({
  user_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.FavoriteCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const FavoriteCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.FavoriteCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FavoriteCreateManyProductInputSchema),z.lazy(() => FavoriteCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ReviewCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateWithoutProductInput> = z.object({
  form_id: z.number(),
  created_at: z.coerce.date().optional(),
  button: z.lazy(() => ButtonCreateNestedOneWithoutReviewsInputSchema),
  answers: z.lazy(() => AnswerCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutProductInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  button_id: z.number(),
  created_at: z.coerce.date().optional(),
  answers: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export const ReviewCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const ReviewCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyProductInputSchema),z.lazy(() => ReviewCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EntityUpsertWithoutProductsInputSchema: z.ZodType<Prisma.EntityUpsertWithoutProductsInput> = z.object({
  update: z.union([ z.lazy(() => EntityUpdateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => EntityCreateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedCreateWithoutProductsInputSchema) ]),
  where: z.lazy(() => EntityWhereInputSchema).optional()
}).strict();

export const EntityUpdateToOneWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.EntityUpdateToOneWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => EntityWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => EntityUpdateWithoutProductsInputSchema),z.lazy(() => EntityUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export const EntityUpdateWithoutProductsInputSchema: z.ZodType<Prisma.EntityUpdateWithoutProductsInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  users: z.lazy(() => UserUpdateManyWithoutEntitiesNestedInputSchema).optional()
}).strict();

export const EntityUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateWithoutProductsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  users: z.lazy(() => UserUncheckedUpdateManyWithoutEntitiesNestedInputSchema).optional()
}).strict();

export const ButtonUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ButtonUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ButtonWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ButtonUpdateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => ButtonCreateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const ButtonUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ButtonUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ButtonWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ButtonUpdateWithoutProductInputSchema),z.lazy(() => ButtonUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export const ButtonUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ButtonUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => ButtonScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ButtonUpdateManyMutationInputSchema),z.lazy(() => ButtonUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export const ButtonScalarWhereInputSchema: z.ZodType<Prisma.ButtonScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ButtonScalarWhereInputSchema),z.lazy(() => ButtonScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ButtonScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ButtonScalarWhereInputSchema),z.lazy(() => ButtonScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isTest: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  product_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const AccessRightUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AccessRightUpdateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => AccessRightCreateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const AccessRightUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => AccessRightWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AccessRightUpdateWithoutProductInputSchema),z.lazy(() => AccessRightUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export const AccessRightUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => AccessRightScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AccessRightUpdateManyMutationInputSchema),z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export const FavoriteUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteUpdateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteCreateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const FavoriteUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateWithoutProductInputSchema),z.lazy(() => FavoriteUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export const FavoriteUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteUpdateManyMutationInputSchema),z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export const ReviewUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ReviewUpdateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export const ReviewUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export const ReviewUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export const UserCreateWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserCreateWithoutAccessRightsInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutAccessRightsInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAccessRightsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccessRightsInputSchema) ]),
}).strict();

export const ProductCreateWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductCreateWithoutAccessRightsInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  entity: z.lazy(() => EntityCreateNestedOneWithoutProductsInputSchema),
  buttons: z.lazy(() => ButtonCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutAccessRightsInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductCreateOrConnectWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutAccessRightsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutAccessRightsInputSchema) ]),
}).strict();

export const UserUpsertWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserUpsertWithoutAccessRightsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccessRightsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedCreateWithoutAccessRightsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutAccessRightsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutAccessRightsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAccessRightsInputSchema) ]),
}).strict();

export const UserUpdateWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserUpdateWithoutAccessRightsInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutAccessRightsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutAccessRightsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const ProductUpsertWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutAccessRightsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutAccessRightsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutAccessRightsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const ProductUpdateToOneWithWhereWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutAccessRightsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutAccessRightsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutAccessRightsInputSchema) ]),
}).strict();

export const ProductUpdateWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutAccessRightsInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entity: z.lazy(() => EntityUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  buttons: z.lazy(() => ButtonUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateWithoutAccessRightsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutAccessRightsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateWithoutFavoritesInput> = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityCreateNestedManyWithoutUsersInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutFavoritesInput> = z.object({
  id: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  active: z.boolean().optional(),
  observatoire_account: z.boolean().optional(),
  observatoire_username: z.string().optional().nullable(),
  email: z.string(),
  password: z.string(),
  role: z.lazy(() => UserRoleSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedCreateNestedManyWithoutUsersInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutFavoritesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]),
}).strict();

export const ProductCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateWithoutFavoritesInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  entity: z.lazy(() => EntityCreateNestedOneWithoutProductsInputSchema),
  buttons: z.lazy(() => ButtonCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutFavoritesInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutFavoritesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]),
}).strict();

export const UserUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUpsertWithoutFavoritesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutFavoritesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutFavoritesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutFavoritesInputSchema) ]),
}).strict();

export const UserUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUpdateWithoutFavoritesInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUpdateManyWithoutUsersNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutFavoritesInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  entities: z.lazy(() => EntityUncheckedUpdateManyWithoutUsersNestedInputSchema).optional()
}).strict();

export const ProductUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUpsertWithoutFavoritesInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const ProductUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutFavoritesInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutFavoritesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutFavoritesInputSchema) ]),
}).strict();

export const ProductUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUpdateWithoutFavoritesInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entity: z.lazy(() => EntityUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  buttons: z.lazy(() => ButtonUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutFavoritesInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateWithoutReviewsInput> = z.object({
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  entity: z.lazy(() => EntityCreateNestedOneWithoutProductsInputSchema),
  buttons: z.lazy(() => ButtonCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateWithoutReviewsInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  entity_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export const ProductCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export const ButtonCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonCreateWithoutReviewsInput> = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutButtonsInputSchema).optional()
}).strict();

export const ButtonUncheckedCreateWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonUncheckedCreateWithoutReviewsInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const ButtonCreateOrConnectWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonCreateOrConnectWithoutReviewsInput> = z.object({
  where: z.lazy(() => ButtonWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ButtonCreateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutReviewsInputSchema) ]),
}).strict();

export const AnswerCreateWithoutReviewInputSchema: z.ZodType<Prisma.AnswerCreateWithoutReviewInput> = z.object({
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema)
}).strict();

export const AnswerUncheckedCreateWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateWithoutReviewInput> = z.object({
  id: z.number().optional(),
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema)
}).strict();

export const AnswerCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.AnswerCreateOrConnectWithoutReviewInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema) ]),
}).strict();

export const AnswerCreateManyReviewInputEnvelopeSchema: z.ZodType<Prisma.AnswerCreateManyReviewInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnswerCreateManyReviewInputSchema),z.lazy(() => AnswerCreateManyReviewInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ProductUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutReviewsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export const ProductUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutReviewsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export const ProductUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUpdateWithoutReviewsInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  entity: z.lazy(() => EntityUpdateOneRequiredWithoutProductsNestedInputSchema).optional(),
  buttons: z.lazy(() => ButtonUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutReviewsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  entity_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ButtonUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonUpsertWithoutReviewsInput> = z.object({
  update: z.union([ z.lazy(() => ButtonUpdateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => ButtonCreateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => ButtonWhereInputSchema).optional()
}).strict();

export const ButtonUpdateToOneWithWhereWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonUpdateToOneWithWhereWithoutReviewsInput> = z.object({
  where: z.lazy(() => ButtonWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ButtonUpdateWithoutReviewsInputSchema),z.lazy(() => ButtonUncheckedUpdateWithoutReviewsInputSchema) ]),
}).strict();

export const ButtonUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonUpdateWithoutReviewsInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutButtonsNestedInputSchema).optional()
}).strict();

export const ButtonUncheckedUpdateWithoutReviewsInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateWithoutReviewsInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerUpsertWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUpsertWithWhereUniqueWithoutReviewInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnswerUpdateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutReviewInputSchema) ]),
  create: z.union([ z.lazy(() => AnswerCreateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutReviewInputSchema) ]),
}).strict();

export const AnswerUpdateWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUpdateWithWhereUniqueWithoutReviewInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateWithoutReviewInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutReviewInputSchema) ]),
}).strict();

export const AnswerUpdateManyWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithWhereWithoutReviewInput> = z.object({
  where: z.lazy(() => AnswerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateManyMutationInputSchema),z.lazy(() => AnswerUncheckedUpdateManyWithoutReviewInputSchema) ]),
}).strict();

export const AnswerScalarWhereInputSchema: z.ZodType<Prisma.AnswerScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  field_label: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  field_code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  answer_item_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  answer_text: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  kind: z.union([ z.lazy(() => EnumAnswerKindFilterSchema),z.lazy(() => AnswerKindSchema) ]).optional(),
  review_id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const ReviewCreateWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewCreateWithoutAnswersInput> = z.object({
  form_id: z.number(),
  created_at: z.coerce.date().optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema),
  button: z.lazy(() => ButtonCreateNestedOneWithoutReviewsInputSchema)
}).strict();

export const ReviewUncheckedCreateWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutAnswersInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  product_id: z.number(),
  button_id: z.number(),
  created_at: z.coerce.date().optional()
}).strict();

export const ReviewCreateOrConnectWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutAnswersInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutAnswersInputSchema) ]),
}).strict();

export const ReviewUpsertWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewUpsertWithoutAnswersInput> = z.object({
  update: z.union([ z.lazy(() => ReviewUpdateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutAnswersInputSchema) ]),
  create: z.union([ z.lazy(() => ReviewCreateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutAnswersInputSchema) ]),
  where: z.lazy(() => ReviewWhereInputSchema).optional()
}).strict();

export const ReviewUpdateToOneWithWhereWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewUpdateToOneWithWhereWithoutAnswersInput> = z.object({
  where: z.lazy(() => ReviewWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutAnswersInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutAnswersInputSchema) ]),
}).strict();

export const ReviewUpdateWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutAnswersInput> = z.object({
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  button: z.lazy(() => ButtonUpdateOneRequiredWithoutReviewsNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateWithoutAnswersInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutAnswersInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  button_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPCreateManyUserInputSchema: z.ZodType<Prisma.UserOTPCreateManyUserInput> = z.object({
  id: z.number().optional(),
  code: z.string(),
  expiration_date: z.coerce.date(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserValidationTokenCreateManyUserInputSchema: z.ZodType<Prisma.UserValidationTokenCreateManyUserInput> = z.object({
  id: z.number().optional(),
  token: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserRequestCreateManyUserInputSchema: z.ZodType<Prisma.UserRequestCreateManyUserInput> = z.object({
  id: z.number().optional(),
  user_email_copy: z.string().optional().nullable(),
  reason: z.string(),
  mode: z.lazy(() => RequestModeSchema).optional(),
  status: z.lazy(() => UserRequestStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightCreateManyUserInputSchema: z.ZodType<Prisma.AccessRightCreateManyUserInput> = z.object({
  id: z.number().optional(),
  user_email_invite: z.string().optional().nullable(),
  product_id: z.number(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteCreateManyUserInputSchema: z.ZodType<Prisma.FavoriteCreateManyUserInput> = z.object({
  product_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const UserOTPUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUpdateWithoutUserInput> = z.object({
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserOTPUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserOTPUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiration_date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUpdateWithoutUserInput> = z.object({
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserValidationTokenUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserValidationTokenUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  token: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUpdateWithoutUserInput> = z.object({
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRequestUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserRequestUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email_copy: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  reason: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  mode: z.union([ z.lazy(() => RequestModeSchema),z.lazy(() => EnumRequestModeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserRequestStatusSchema),z.lazy(() => EnumUserRequestStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUpdateWithoutUserInput> = z.object({
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutAccessRightsNestedInputSchema).optional()
}).strict();

export const AccessRightUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EntityUpdateWithoutUsersInputSchema: z.ZodType<Prisma.EntityUpdateWithoutUsersInput> = z.object({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  products: z.lazy(() => ProductUpdateManyWithoutEntityNestedInputSchema).optional()
}).strict();

export const EntityUncheckedUpdateWithoutUsersInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateWithoutUsersInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  products: z.lazy(() => ProductUncheckedUpdateManyWithoutEntityNestedInputSchema).optional()
}).strict();

export const EntityUncheckedUpdateManyWithoutUsersInputSchema: z.ZodType<Prisma.EntityUncheckedUpdateManyWithoutUsersInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  acronym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateWithoutUserInput> = z.object({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional()
}).strict();

export const FavoriteUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateWithoutUserInput> = z.object({
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutUserInput> = z.object({
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ProductCreateManyEntityInputSchema: z.ZodType<Prisma.ProductCreateManyEntityInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  isEssential: z.boolean().optional().nullable(),
  urls: z.union([ z.lazy(() => ProductCreateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.number().optional().nullable(),
  observatoire_id: z.number().optional().nullable()
}).strict();

export const ProductUpdateWithoutEntityInputSchema: z.ZodType<Prisma.ProductUpdateWithoutEntityInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateWithoutEntityInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateWithoutEntityInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  buttons: z.lazy(() => ButtonUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutProductNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutProductNestedInputSchema).optional()
}).strict();

export const ProductUncheckedUpdateManyWithoutEntityInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutEntityInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isEssential: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  urls: z.union([ z.lazy(() => ProductUpdateurlsInputSchema),z.string().array() ]).optional(),
  volume: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  observatoire_id: z.union([ z.number(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserUpdateWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUpdateWithoutEntitiesInput> = z.object({
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUpdateManyWithoutUserNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutEntitiesInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserOTPs: z.lazy(() => UserOTPUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserValidationTokens: z.lazy(() => UserValidationTokenUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserRequests: z.lazy(() => UserRequestUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accessRights: z.lazy(() => AccessRightUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateManyWithoutEntitiesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutEntitiesInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_account: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  observatoire_username: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => UserRoleSchema),z.lazy(() => EnumUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewCreateManyButtonInputSchema: z.ZodType<Prisma.ReviewCreateManyButtonInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  product_id: z.number(),
  created_at: z.coerce.date().optional()
}).strict();

export const ReviewUpdateWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutButtonInput> = z.object({
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  answers: z.lazy(() => AnswerUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutButtonInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  answers: z.lazy(() => AnswerUncheckedUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateManyWithoutButtonInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutButtonInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  product_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ButtonCreateManyProductInputSchema: z.ZodType<Prisma.ButtonCreateManyProductInput> = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  isTest: z.boolean().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const AccessRightCreateManyProductInputSchema: z.ZodType<Prisma.AccessRightCreateManyProductInput> = z.object({
  id: z.number().optional(),
  user_email: z.string().optional().nullable(),
  user_email_invite: z.string().optional().nullable(),
  status: z.lazy(() => RightAccessStatusSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const FavoriteCreateManyProductInputSchema: z.ZodType<Prisma.FavoriteCreateManyProductInput> = z.object({
  user_id: z.number(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional()
}).strict();

export const ReviewCreateManyProductInputSchema: z.ZodType<Prisma.ReviewCreateManyProductInput> = z.object({
  id: z.number().optional(),
  form_id: z.number(),
  button_id: z.number(),
  created_at: z.coerce.date().optional()
}).strict();

export const ButtonUpdateWithoutProductInputSchema: z.ZodType<Prisma.ButtonUpdateWithoutProductInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutButtonNestedInputSchema).optional()
}).strict();

export const ButtonUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutButtonNestedInputSchema).optional()
}).strict();

export const ButtonUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ButtonUncheckedUpdateManyWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isTest: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightUpdateWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUpdateWithoutProductInput> = z.object({
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneWithoutAccessRightsNestedInputSchema).optional()
}).strict();

export const AccessRightUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AccessRightUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.AccessRightUncheckedUpdateManyWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_email_invite: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.lazy(() => RightAccessStatusSchema),z.lazy(() => EnumRightAccessStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteUpdateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUpdateWithoutProductInput> = z.object({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional()
}).strict();

export const FavoriteUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateWithoutProductInput> = z.object({
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const FavoriteUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.FavoriteUncheckedUpdateManyWithoutProductInput> = z.object({
  user_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ReviewUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithoutProductInput> = z.object({
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  button: z.lazy(() => ButtonUpdateOneRequiredWithoutReviewsNestedInputSchema).optional(),
  answers: z.lazy(() => AnswerUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  button_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  answers: z.lazy(() => AnswerUncheckedUpdateManyWithoutReviewNestedInputSchema).optional()
}).strict();

export const ReviewUncheckedUpdateManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  form_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  button_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerCreateManyReviewInputSchema: z.ZodType<Prisma.AnswerCreateManyReviewInput> = z.object({
  id: z.number().optional(),
  field_label: z.string(),
  field_code: z.string(),
  answer_item_id: z.number(),
  answer_text: z.string(),
  kind: z.lazy(() => AnswerKindSchema)
}).strict();

export const AnswerUpdateWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUpdateWithoutReviewInput> = z.object({
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerUncheckedUpdateWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateWithoutReviewInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyWithoutReviewInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutReviewInput> = z.object({
  id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  field_label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  field_code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  answer_item_id: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  answer_text: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  kind: z.union([ z.lazy(() => AnswerKindSchema),z.lazy(() => EnumAnswerKindFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserFindFirstArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserFindManyArgsSchema: z.ZodType<Omit<Prisma.UserFindManyArgs, "select" | "include">> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserFindUniqueArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserRequestFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserRequestFindFirstArgs, "select" | "include">> = z.object({
  where: UserRequestWhereInputSchema.optional(),
  orderBy: z.union([ UserRequestOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserRequestOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRequestScalarFieldEnumSchema,UserRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserRequestFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserRequestFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserRequestWhereInputSchema.optional(),
  orderBy: z.union([ UserRequestOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserRequestOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRequestScalarFieldEnumSchema,UserRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserRequestFindManyArgsSchema: z.ZodType<Omit<Prisma.UserRequestFindManyArgs, "select" | "include">> = z.object({
  where: UserRequestWhereInputSchema.optional(),
  orderBy: z.union([ UserRequestOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserRequestOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRequestScalarFieldEnumSchema,UserRequestScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserRequestAggregateArgsSchema: z.ZodType<Prisma.UserRequestAggregateArgs> = z.object({
  where: UserRequestWhereInputSchema.optional(),
  orderBy: z.union([ UserRequestOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserRequestOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserRequestWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserRequestGroupByArgsSchema: z.ZodType<Prisma.UserRequestGroupByArgs> = z.object({
  where: UserRequestWhereInputSchema.optional(),
  orderBy: z.union([ UserRequestOrderByWithAggregationInputSchema.array(),UserRequestOrderByWithAggregationInputSchema ]).optional(),
  by: UserRequestScalarFieldEnumSchema.array(),
  having: UserRequestScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserRequestFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserRequestFindUniqueArgs, "select" | "include">> = z.object({
  where: UserRequestWhereUniqueInputSchema,
}).strict()

export const UserRequestFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserRequestFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserRequestWhereUniqueInputSchema,
}).strict()

export const UserOTPFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserOTPFindFirstArgs, "select" | "include">> = z.object({
  where: UserOTPWhereInputSchema.optional(),
  orderBy: z.union([ UserOTPOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOTPOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserOTPWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOTPScalarFieldEnumSchema,UserOTPScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserOTPFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserOTPFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserOTPWhereInputSchema.optional(),
  orderBy: z.union([ UserOTPOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOTPOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserOTPWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOTPScalarFieldEnumSchema,UserOTPScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserOTPFindManyArgsSchema: z.ZodType<Omit<Prisma.UserOTPFindManyArgs, "select" | "include">> = z.object({
  where: UserOTPWhereInputSchema.optional(),
  orderBy: z.union([ UserOTPOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOTPOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserOTPWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserOTPScalarFieldEnumSchema,UserOTPScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserOTPAggregateArgsSchema: z.ZodType<Prisma.UserOTPAggregateArgs> = z.object({
  where: UserOTPWhereInputSchema.optional(),
  orderBy: z.union([ UserOTPOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserOTPOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserOTPWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserOTPGroupByArgsSchema: z.ZodType<Prisma.UserOTPGroupByArgs> = z.object({
  where: UserOTPWhereInputSchema.optional(),
  orderBy: z.union([ UserOTPOrderByWithAggregationInputSchema.array(),UserOTPOrderByWithAggregationInputSchema ]).optional(),
  by: UserOTPScalarFieldEnumSchema.array(),
  having: UserOTPScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserOTPFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserOTPFindUniqueArgs, "select" | "include">> = z.object({
  where: UserOTPWhereUniqueInputSchema,
}).strict()

export const UserOTPFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserOTPFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserOTPWhereUniqueInputSchema,
}).strict()

export const UserValidationTokenFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenFindFirstArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserValidationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserValidationTokenScalarFieldEnumSchema,UserValidationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserValidationTokenFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserValidationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserValidationTokenScalarFieldEnumSchema,UserValidationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserValidationTokenFindManyArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenFindManyArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserValidationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserValidationTokenScalarFieldEnumSchema,UserValidationTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserValidationTokenAggregateArgsSchema: z.ZodType<Prisma.UserValidationTokenAggregateArgs> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserValidationTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserValidationTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserValidationTokenGroupByArgsSchema: z.ZodType<Prisma.UserValidationTokenGroupByArgs> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserValidationTokenOrderByWithAggregationInputSchema.array(),UserValidationTokenOrderByWithAggregationInputSchema ]).optional(),
  by: UserValidationTokenScalarFieldEnumSchema.array(),
  having: UserValidationTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserValidationTokenFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenFindUniqueArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereUniqueInputSchema,
}).strict()

export const UserValidationTokenFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereUniqueInputSchema,
}).strict()

export const UserInviteTokenFindFirstArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenFindFirstArgs, "select">> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserInviteTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteTokenScalarFieldEnumSchema,UserInviteTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserInviteTokenFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenFindFirstOrThrowArgs, "select">> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserInviteTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteTokenScalarFieldEnumSchema,UserInviteTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserInviteTokenFindManyArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenFindManyArgs, "select">> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserInviteTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserInviteTokenScalarFieldEnumSchema,UserInviteTokenScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const UserInviteTokenAggregateArgsSchema: z.ZodType<Prisma.UserInviteTokenAggregateArgs> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema.array(),UserInviteTokenOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: UserInviteTokenWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserInviteTokenGroupByArgsSchema: z.ZodType<Prisma.UserInviteTokenGroupByArgs> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
  orderBy: z.union([ UserInviteTokenOrderByWithAggregationInputSchema.array(),UserInviteTokenOrderByWithAggregationInputSchema ]).optional(),
  by: UserInviteTokenScalarFieldEnumSchema.array(),
  having: UserInviteTokenScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const UserInviteTokenFindUniqueArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenFindUniqueArgs, "select">> = z.object({
  where: UserInviteTokenWhereUniqueInputSchema,
}).strict()

export const UserInviteTokenFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenFindUniqueOrThrowArgs, "select">> = z.object({
  where: UserInviteTokenWhereUniqueInputSchema,
}).strict()

export const EntityFindFirstArgsSchema: z.ZodType<Omit<Prisma.EntityFindFirstArgs, "select" | "include">> = z.object({
  where: EntityWhereInputSchema.optional(),
  orderBy: z.union([ EntityOrderByWithRelationAndSearchRelevanceInputSchema.array(),EntityOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: EntityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntityScalarFieldEnumSchema,EntityScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EntityFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.EntityFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: EntityWhereInputSchema.optional(),
  orderBy: z.union([ EntityOrderByWithRelationAndSearchRelevanceInputSchema.array(),EntityOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: EntityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntityScalarFieldEnumSchema,EntityScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EntityFindManyArgsSchema: z.ZodType<Omit<Prisma.EntityFindManyArgs, "select" | "include">> = z.object({
  where: EntityWhereInputSchema.optional(),
  orderBy: z.union([ EntityOrderByWithRelationAndSearchRelevanceInputSchema.array(),EntityOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: EntityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EntityScalarFieldEnumSchema,EntityScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const EntityAggregateArgsSchema: z.ZodType<Prisma.EntityAggregateArgs> = z.object({
  where: EntityWhereInputSchema.optional(),
  orderBy: z.union([ EntityOrderByWithRelationAndSearchRelevanceInputSchema.array(),EntityOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: EntityWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const EntityGroupByArgsSchema: z.ZodType<Prisma.EntityGroupByArgs> = z.object({
  where: EntityWhereInputSchema.optional(),
  orderBy: z.union([ EntityOrderByWithAggregationInputSchema.array(),EntityOrderByWithAggregationInputSchema ]).optional(),
  by: EntityScalarFieldEnumSchema.array(),
  having: EntityScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const EntityFindUniqueArgsSchema: z.ZodType<Omit<Prisma.EntityFindUniqueArgs, "select" | "include">> = z.object({
  where: EntityWhereUniqueInputSchema,
}).strict()

export const EntityFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.EntityFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: EntityWhereUniqueInputSchema,
}).strict()

export const ButtonFindFirstArgsSchema: z.ZodType<Omit<Prisma.ButtonFindFirstArgs, "select" | "include">> = z.object({
  where: ButtonWhereInputSchema.optional(),
  orderBy: z.union([ ButtonOrderByWithRelationAndSearchRelevanceInputSchema.array(),ButtonOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ButtonWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ButtonScalarFieldEnumSchema,ButtonScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ButtonFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.ButtonFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: ButtonWhereInputSchema.optional(),
  orderBy: z.union([ ButtonOrderByWithRelationAndSearchRelevanceInputSchema.array(),ButtonOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ButtonWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ButtonScalarFieldEnumSchema,ButtonScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ButtonFindManyArgsSchema: z.ZodType<Omit<Prisma.ButtonFindManyArgs, "select" | "include">> = z.object({
  where: ButtonWhereInputSchema.optional(),
  orderBy: z.union([ ButtonOrderByWithRelationAndSearchRelevanceInputSchema.array(),ButtonOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ButtonWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ButtonScalarFieldEnumSchema,ButtonScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ButtonAggregateArgsSchema: z.ZodType<Prisma.ButtonAggregateArgs> = z.object({
  where: ButtonWhereInputSchema.optional(),
  orderBy: z.union([ ButtonOrderByWithRelationAndSearchRelevanceInputSchema.array(),ButtonOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ButtonWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ButtonGroupByArgsSchema: z.ZodType<Prisma.ButtonGroupByArgs> = z.object({
  where: ButtonWhereInputSchema.optional(),
  orderBy: z.union([ ButtonOrderByWithAggregationInputSchema.array(),ButtonOrderByWithAggregationInputSchema ]).optional(),
  by: ButtonScalarFieldEnumSchema.array(),
  having: ButtonScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ButtonFindUniqueArgsSchema: z.ZodType<Omit<Prisma.ButtonFindUniqueArgs, "select" | "include">> = z.object({
  where: ButtonWhereUniqueInputSchema,
}).strict()

export const ButtonFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.ButtonFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: ButtonWhereUniqueInputSchema,
}).strict()

export const ProductFindFirstArgsSchema: z.ZodType<Omit<Prisma.ProductFindFirstArgs, "select" | "include">> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationAndSearchRelevanceInputSchema.array(),ProductOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ProductFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.ProductFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationAndSearchRelevanceInputSchema.array(),ProductOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ProductFindManyArgsSchema: z.ZodType<Omit<Prisma.ProductFindManyArgs, "select" | "include">> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationAndSearchRelevanceInputSchema.array(),ProductOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ProductScalarFieldEnumSchema,ProductScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ProductAggregateArgsSchema: z.ZodType<Prisma.ProductAggregateArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationAndSearchRelevanceInputSchema.array(),ProductOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ProductGroupByArgsSchema: z.ZodType<Prisma.ProductGroupByArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithAggregationInputSchema.array(),ProductOrderByWithAggregationInputSchema ]).optional(),
  by: ProductScalarFieldEnumSchema.array(),
  having: ProductScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ProductFindUniqueArgsSchema: z.ZodType<Omit<Prisma.ProductFindUniqueArgs, "select" | "include">> = z.object({
  where: ProductWhereUniqueInputSchema,
}).strict()

export const ProductFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.ProductFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: ProductWhereUniqueInputSchema,
}).strict()

export const AccessRightFindFirstArgsSchema: z.ZodType<Omit<Prisma.AccessRightFindFirstArgs, "select" | "include">> = z.object({
  where: AccessRightWhereInputSchema.optional(),
  orderBy: z.union([ AccessRightOrderByWithRelationAndSearchRelevanceInputSchema.array(),AccessRightOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AccessRightWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccessRightScalarFieldEnumSchema,AccessRightScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccessRightFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.AccessRightFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: AccessRightWhereInputSchema.optional(),
  orderBy: z.union([ AccessRightOrderByWithRelationAndSearchRelevanceInputSchema.array(),AccessRightOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AccessRightWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccessRightScalarFieldEnumSchema,AccessRightScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccessRightFindManyArgsSchema: z.ZodType<Omit<Prisma.AccessRightFindManyArgs, "select" | "include">> = z.object({
  where: AccessRightWhereInputSchema.optional(),
  orderBy: z.union([ AccessRightOrderByWithRelationAndSearchRelevanceInputSchema.array(),AccessRightOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AccessRightWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AccessRightScalarFieldEnumSchema,AccessRightScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AccessRightAggregateArgsSchema: z.ZodType<Prisma.AccessRightAggregateArgs> = z.object({
  where: AccessRightWhereInputSchema.optional(),
  orderBy: z.union([ AccessRightOrderByWithRelationAndSearchRelevanceInputSchema.array(),AccessRightOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AccessRightWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AccessRightGroupByArgsSchema: z.ZodType<Prisma.AccessRightGroupByArgs> = z.object({
  where: AccessRightWhereInputSchema.optional(),
  orderBy: z.union([ AccessRightOrderByWithAggregationInputSchema.array(),AccessRightOrderByWithAggregationInputSchema ]).optional(),
  by: AccessRightScalarFieldEnumSchema.array(),
  having: AccessRightScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AccessRightFindUniqueArgsSchema: z.ZodType<Omit<Prisma.AccessRightFindUniqueArgs, "select" | "include">> = z.object({
  where: AccessRightWhereUniqueInputSchema,
}).strict()

export const AccessRightFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.AccessRightFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: AccessRightWhereUniqueInputSchema,
}).strict()

export const WhiteListedDomainFindFirstArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainFindFirstArgs, "select">> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
  orderBy: z.union([ WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema.array(),WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: WhiteListedDomainWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteListedDomainScalarFieldEnumSchema,WhiteListedDomainScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const WhiteListedDomainFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainFindFirstOrThrowArgs, "select">> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
  orderBy: z.union([ WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema.array(),WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: WhiteListedDomainWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteListedDomainScalarFieldEnumSchema,WhiteListedDomainScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const WhiteListedDomainFindManyArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainFindManyArgs, "select">> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
  orderBy: z.union([ WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema.array(),WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: WhiteListedDomainWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WhiteListedDomainScalarFieldEnumSchema,WhiteListedDomainScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const WhiteListedDomainAggregateArgsSchema: z.ZodType<Prisma.WhiteListedDomainAggregateArgs> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
  orderBy: z.union([ WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema.array(),WhiteListedDomainOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: WhiteListedDomainWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const WhiteListedDomainGroupByArgsSchema: z.ZodType<Prisma.WhiteListedDomainGroupByArgs> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
  orderBy: z.union([ WhiteListedDomainOrderByWithAggregationInputSchema.array(),WhiteListedDomainOrderByWithAggregationInputSchema ]).optional(),
  by: WhiteListedDomainScalarFieldEnumSchema.array(),
  having: WhiteListedDomainScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const WhiteListedDomainFindUniqueArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainFindUniqueArgs, "select">> = z.object({
  where: WhiteListedDomainWhereUniqueInputSchema,
}).strict()

export const WhiteListedDomainFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainFindUniqueOrThrowArgs, "select">> = z.object({
  where: WhiteListedDomainWhereUniqueInputSchema,
}).strict()

export const FavoriteFindFirstArgsSchema: z.ZodType<Omit<Prisma.FavoriteFindFirstArgs, "select" | "include">> = z.object({
  where: FavoriteWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteOrderByWithRelationAndSearchRelevanceInputSchema.array(),FavoriteOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: FavoriteWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoriteScalarFieldEnumSchema,FavoriteScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const FavoriteFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.FavoriteFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: FavoriteWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteOrderByWithRelationAndSearchRelevanceInputSchema.array(),FavoriteOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: FavoriteWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoriteScalarFieldEnumSchema,FavoriteScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const FavoriteFindManyArgsSchema: z.ZodType<Omit<Prisma.FavoriteFindManyArgs, "select" | "include">> = z.object({
  where: FavoriteWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteOrderByWithRelationAndSearchRelevanceInputSchema.array(),FavoriteOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: FavoriteWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoriteScalarFieldEnumSchema,FavoriteScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const FavoriteAggregateArgsSchema: z.ZodType<Prisma.FavoriteAggregateArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteOrderByWithRelationAndSearchRelevanceInputSchema.array(),FavoriteOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: FavoriteWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const FavoriteGroupByArgsSchema: z.ZodType<Prisma.FavoriteGroupByArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(),
  orderBy: z.union([ FavoriteOrderByWithAggregationInputSchema.array(),FavoriteOrderByWithAggregationInputSchema ]).optional(),
  by: FavoriteScalarFieldEnumSchema.array(),
  having: FavoriteScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const FavoriteFindUniqueArgsSchema: z.ZodType<Omit<Prisma.FavoriteFindUniqueArgs, "select" | "include">> = z.object({
  where: FavoriteWhereUniqueInputSchema,
}).strict()

export const FavoriteFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.FavoriteFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: FavoriteWhereUniqueInputSchema,
}).strict()

export const ReviewFindFirstArgsSchema: z.ZodType<Omit<Prisma.ReviewFindFirstArgs, "select" | "include">> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationAndSearchRelevanceInputSchema.array(),ReviewOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.ReviewFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationAndSearchRelevanceInputSchema.array(),ReviewOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewFindManyArgsSchema: z.ZodType<Omit<Prisma.ReviewFindManyArgs, "select" | "include">> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationAndSearchRelevanceInputSchema.array(),ReviewOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewScalarFieldEnumSchema,ReviewScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ReviewAggregateArgsSchema: z.ZodType<Prisma.ReviewAggregateArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationAndSearchRelevanceInputSchema.array(),ReviewOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReviewGroupByArgsSchema: z.ZodType<Prisma.ReviewGroupByArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithAggregationInputSchema.array(),ReviewOrderByWithAggregationInputSchema ]).optional(),
  by: ReviewScalarFieldEnumSchema.array(),
  having: ReviewScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ReviewFindUniqueArgsSchema: z.ZodType<Omit<Prisma.ReviewFindUniqueArgs, "select" | "include">> = z.object({
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.ReviewFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const AnswerFindFirstArgsSchema: z.ZodType<Omit<Prisma.AnswerFindFirstArgs, "select" | "include">> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationAndSearchRelevanceInputSchema.array(),AnswerOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AnswerFindFirstOrThrowArgsSchema: z.ZodType<Omit<Prisma.AnswerFindFirstOrThrowArgs, "select" | "include">> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationAndSearchRelevanceInputSchema.array(),AnswerOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AnswerFindManyArgsSchema: z.ZodType<Omit<Prisma.AnswerFindManyArgs, "select" | "include">> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationAndSearchRelevanceInputSchema.array(),AnswerOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const AnswerAggregateArgsSchema: z.ZodType<Prisma.AnswerAggregateArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationAndSearchRelevanceInputSchema.array(),AnswerOrderByWithRelationAndSearchRelevanceInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AnswerGroupByArgsSchema: z.ZodType<Prisma.AnswerGroupByArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithAggregationInputSchema.array(),AnswerOrderByWithAggregationInputSchema ]).optional(),
  by: AnswerScalarFieldEnumSchema.array(),
  having: AnswerScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const AnswerFindUniqueArgsSchema: z.ZodType<Omit<Prisma.AnswerFindUniqueArgs, "select" | "include">> = z.object({
  where: AnswerWhereUniqueInputSchema,
}).strict()

export const AnswerFindUniqueOrThrowArgsSchema: z.ZodType<Omit<Prisma.AnswerFindUniqueOrThrowArgs, "select" | "include">> = z.object({
  where: AnswerWhereUniqueInputSchema,
}).strict()

export const UserCreateArgsSchema: z.ZodType<Omit<Prisma.UserCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict()

export const UserUpsertArgsSchema: z.ZodType<Omit<Prisma.UserUpsertArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict()

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserDeleteArgsSchema: z.ZodType<Omit<Prisma.UserDeleteArgs, "select" | "include">> = z.object({
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserUpdateArgsSchema: z.ZodType<Omit<Prisma.UserUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict()

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict()

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict()

export const UserRequestCreateArgsSchema: z.ZodType<Omit<Prisma.UserRequestCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserRequestCreateInputSchema,UserRequestUncheckedCreateInputSchema ]),
}).strict()

export const UserRequestUpsertArgsSchema: z.ZodType<Omit<Prisma.UserRequestUpsertArgs, "select" | "include">> = z.object({
  where: UserRequestWhereUniqueInputSchema,
  create: z.union([ UserRequestCreateInputSchema,UserRequestUncheckedCreateInputSchema ]),
  update: z.union([ UserRequestUpdateInputSchema,UserRequestUncheckedUpdateInputSchema ]),
}).strict()

export const UserRequestCreateManyArgsSchema: z.ZodType<Prisma.UserRequestCreateManyArgs> = z.object({
  data: z.union([ UserRequestCreateManyInputSchema,UserRequestCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserRequestDeleteArgsSchema: z.ZodType<Omit<Prisma.UserRequestDeleteArgs, "select" | "include">> = z.object({
  where: UserRequestWhereUniqueInputSchema,
}).strict()

export const UserRequestUpdateArgsSchema: z.ZodType<Omit<Prisma.UserRequestUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserRequestUpdateInputSchema,UserRequestUncheckedUpdateInputSchema ]),
  where: UserRequestWhereUniqueInputSchema,
}).strict()

export const UserRequestUpdateManyArgsSchema: z.ZodType<Prisma.UserRequestUpdateManyArgs> = z.object({
  data: z.union([ UserRequestUpdateManyMutationInputSchema,UserRequestUncheckedUpdateManyInputSchema ]),
  where: UserRequestWhereInputSchema.optional(),
}).strict()

export const UserRequestDeleteManyArgsSchema: z.ZodType<Prisma.UserRequestDeleteManyArgs> = z.object({
  where: UserRequestWhereInputSchema.optional(),
}).strict()

export const UserOTPCreateArgsSchema: z.ZodType<Omit<Prisma.UserOTPCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserOTPCreateInputSchema,UserOTPUncheckedCreateInputSchema ]),
}).strict()

export const UserOTPUpsertArgsSchema: z.ZodType<Omit<Prisma.UserOTPUpsertArgs, "select" | "include">> = z.object({
  where: UserOTPWhereUniqueInputSchema,
  create: z.union([ UserOTPCreateInputSchema,UserOTPUncheckedCreateInputSchema ]),
  update: z.union([ UserOTPUpdateInputSchema,UserOTPUncheckedUpdateInputSchema ]),
}).strict()

export const UserOTPCreateManyArgsSchema: z.ZodType<Prisma.UserOTPCreateManyArgs> = z.object({
  data: z.union([ UserOTPCreateManyInputSchema,UserOTPCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserOTPDeleteArgsSchema: z.ZodType<Omit<Prisma.UserOTPDeleteArgs, "select" | "include">> = z.object({
  where: UserOTPWhereUniqueInputSchema,
}).strict()

export const UserOTPUpdateArgsSchema: z.ZodType<Omit<Prisma.UserOTPUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserOTPUpdateInputSchema,UserOTPUncheckedUpdateInputSchema ]),
  where: UserOTPWhereUniqueInputSchema,
}).strict()

export const UserOTPUpdateManyArgsSchema: z.ZodType<Prisma.UserOTPUpdateManyArgs> = z.object({
  data: z.union([ UserOTPUpdateManyMutationInputSchema,UserOTPUncheckedUpdateManyInputSchema ]),
  where: UserOTPWhereInputSchema.optional(),
}).strict()

export const UserOTPDeleteManyArgsSchema: z.ZodType<Prisma.UserOTPDeleteManyArgs> = z.object({
  where: UserOTPWhereInputSchema.optional(),
}).strict()

export const UserValidationTokenCreateArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenCreateArgs, "select" | "include">> = z.object({
  data: z.union([ UserValidationTokenCreateInputSchema,UserValidationTokenUncheckedCreateInputSchema ]),
}).strict()

export const UserValidationTokenUpsertArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenUpsertArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereUniqueInputSchema,
  create: z.union([ UserValidationTokenCreateInputSchema,UserValidationTokenUncheckedCreateInputSchema ]),
  update: z.union([ UserValidationTokenUpdateInputSchema,UserValidationTokenUncheckedUpdateInputSchema ]),
}).strict()

export const UserValidationTokenCreateManyArgsSchema: z.ZodType<Prisma.UserValidationTokenCreateManyArgs> = z.object({
  data: z.union([ UserValidationTokenCreateManyInputSchema,UserValidationTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserValidationTokenDeleteArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenDeleteArgs, "select" | "include">> = z.object({
  where: UserValidationTokenWhereUniqueInputSchema,
}).strict()

export const UserValidationTokenUpdateArgsSchema: z.ZodType<Omit<Prisma.UserValidationTokenUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ UserValidationTokenUpdateInputSchema,UserValidationTokenUncheckedUpdateInputSchema ]),
  where: UserValidationTokenWhereUniqueInputSchema,
}).strict()

export const UserValidationTokenUpdateManyArgsSchema: z.ZodType<Prisma.UserValidationTokenUpdateManyArgs> = z.object({
  data: z.union([ UserValidationTokenUpdateManyMutationInputSchema,UserValidationTokenUncheckedUpdateManyInputSchema ]),
  where: UserValidationTokenWhereInputSchema.optional(),
}).strict()

export const UserValidationTokenDeleteManyArgsSchema: z.ZodType<Prisma.UserValidationTokenDeleteManyArgs> = z.object({
  where: UserValidationTokenWhereInputSchema.optional(),
}).strict()

export const UserInviteTokenCreateArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenCreateArgs, "select">> = z.object({
  data: z.union([ UserInviteTokenCreateInputSchema,UserInviteTokenUncheckedCreateInputSchema ]),
}).strict()

export const UserInviteTokenUpsertArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenUpsertArgs, "select">> = z.object({
  where: UserInviteTokenWhereUniqueInputSchema,
  create: z.union([ UserInviteTokenCreateInputSchema,UserInviteTokenUncheckedCreateInputSchema ]),
  update: z.union([ UserInviteTokenUpdateInputSchema,UserInviteTokenUncheckedUpdateInputSchema ]),
}).strict()

export const UserInviteTokenCreateManyArgsSchema: z.ZodType<Prisma.UserInviteTokenCreateManyArgs> = z.object({
  data: z.union([ UserInviteTokenCreateManyInputSchema,UserInviteTokenCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const UserInviteTokenDeleteArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenDeleteArgs, "select">> = z.object({
  where: UserInviteTokenWhereUniqueInputSchema,
}).strict()

export const UserInviteTokenUpdateArgsSchema: z.ZodType<Omit<Prisma.UserInviteTokenUpdateArgs, "select">> = z.object({
  data: z.union([ UserInviteTokenUpdateInputSchema,UserInviteTokenUncheckedUpdateInputSchema ]),
  where: UserInviteTokenWhereUniqueInputSchema,
}).strict()

export const UserInviteTokenUpdateManyArgsSchema: z.ZodType<Prisma.UserInviteTokenUpdateManyArgs> = z.object({
  data: z.union([ UserInviteTokenUpdateManyMutationInputSchema,UserInviteTokenUncheckedUpdateManyInputSchema ]),
  where: UserInviteTokenWhereInputSchema.optional(),
}).strict()

export const UserInviteTokenDeleteManyArgsSchema: z.ZodType<Prisma.UserInviteTokenDeleteManyArgs> = z.object({
  where: UserInviteTokenWhereInputSchema.optional(),
}).strict()

export const EntityCreateArgsSchema: z.ZodType<Omit<Prisma.EntityCreateArgs, "select" | "include">> = z.object({
  data: z.union([ EntityCreateInputSchema,EntityUncheckedCreateInputSchema ]),
}).strict()

export const EntityUpsertArgsSchema: z.ZodType<Omit<Prisma.EntityUpsertArgs, "select" | "include">> = z.object({
  where: EntityWhereUniqueInputSchema,
  create: z.union([ EntityCreateInputSchema,EntityUncheckedCreateInputSchema ]),
  update: z.union([ EntityUpdateInputSchema,EntityUncheckedUpdateInputSchema ]),
}).strict()

export const EntityCreateManyArgsSchema: z.ZodType<Prisma.EntityCreateManyArgs> = z.object({
  data: z.union([ EntityCreateManyInputSchema,EntityCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const EntityDeleteArgsSchema: z.ZodType<Omit<Prisma.EntityDeleteArgs, "select" | "include">> = z.object({
  where: EntityWhereUniqueInputSchema,
}).strict()

export const EntityUpdateArgsSchema: z.ZodType<Omit<Prisma.EntityUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ EntityUpdateInputSchema,EntityUncheckedUpdateInputSchema ]),
  where: EntityWhereUniqueInputSchema,
}).strict()

export const EntityUpdateManyArgsSchema: z.ZodType<Prisma.EntityUpdateManyArgs> = z.object({
  data: z.union([ EntityUpdateManyMutationInputSchema,EntityUncheckedUpdateManyInputSchema ]),
  where: EntityWhereInputSchema.optional(),
}).strict()

export const EntityDeleteManyArgsSchema: z.ZodType<Prisma.EntityDeleteManyArgs> = z.object({
  where: EntityWhereInputSchema.optional(),
}).strict()

export const ButtonCreateArgsSchema: z.ZodType<Omit<Prisma.ButtonCreateArgs, "select" | "include">> = z.object({
  data: z.union([ ButtonCreateInputSchema,ButtonUncheckedCreateInputSchema ]),
}).strict()

export const ButtonUpsertArgsSchema: z.ZodType<Omit<Prisma.ButtonUpsertArgs, "select" | "include">> = z.object({
  where: ButtonWhereUniqueInputSchema,
  create: z.union([ ButtonCreateInputSchema,ButtonUncheckedCreateInputSchema ]),
  update: z.union([ ButtonUpdateInputSchema,ButtonUncheckedUpdateInputSchema ]),
}).strict()

export const ButtonCreateManyArgsSchema: z.ZodType<Prisma.ButtonCreateManyArgs> = z.object({
  data: z.union([ ButtonCreateManyInputSchema,ButtonCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ButtonDeleteArgsSchema: z.ZodType<Omit<Prisma.ButtonDeleteArgs, "select" | "include">> = z.object({
  where: ButtonWhereUniqueInputSchema,
}).strict()

export const ButtonUpdateArgsSchema: z.ZodType<Omit<Prisma.ButtonUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ ButtonUpdateInputSchema,ButtonUncheckedUpdateInputSchema ]),
  where: ButtonWhereUniqueInputSchema,
}).strict()

export const ButtonUpdateManyArgsSchema: z.ZodType<Prisma.ButtonUpdateManyArgs> = z.object({
  data: z.union([ ButtonUpdateManyMutationInputSchema,ButtonUncheckedUpdateManyInputSchema ]),
  where: ButtonWhereInputSchema.optional(),
}).strict()

export const ButtonDeleteManyArgsSchema: z.ZodType<Prisma.ButtonDeleteManyArgs> = z.object({
  where: ButtonWhereInputSchema.optional(),
}).strict()

export const ProductCreateArgsSchema: z.ZodType<Omit<Prisma.ProductCreateArgs, "select" | "include">> = z.object({
  data: z.union([ ProductCreateInputSchema,ProductUncheckedCreateInputSchema ]),
}).strict()

export const ProductUpsertArgsSchema: z.ZodType<Omit<Prisma.ProductUpsertArgs, "select" | "include">> = z.object({
  where: ProductWhereUniqueInputSchema,
  create: z.union([ ProductCreateInputSchema,ProductUncheckedCreateInputSchema ]),
  update: z.union([ ProductUpdateInputSchema,ProductUncheckedUpdateInputSchema ]),
}).strict()

export const ProductCreateManyArgsSchema: z.ZodType<Prisma.ProductCreateManyArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema,ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ProductDeleteArgsSchema: z.ZodType<Omit<Prisma.ProductDeleteArgs, "select" | "include">> = z.object({
  where: ProductWhereUniqueInputSchema,
}).strict()

export const ProductUpdateArgsSchema: z.ZodType<Omit<Prisma.ProductUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ ProductUpdateInputSchema,ProductUncheckedUpdateInputSchema ]),
  where: ProductWhereUniqueInputSchema,
}).strict()

export const ProductUpdateManyArgsSchema: z.ZodType<Prisma.ProductUpdateManyArgs> = z.object({
  data: z.union([ ProductUpdateManyMutationInputSchema,ProductUncheckedUpdateManyInputSchema ]),
  where: ProductWhereInputSchema.optional(),
}).strict()

export const ProductDeleteManyArgsSchema: z.ZodType<Prisma.ProductDeleteManyArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
}).strict()

export const AccessRightCreateArgsSchema: z.ZodType<Omit<Prisma.AccessRightCreateArgs, "select" | "include">> = z.object({
  data: z.union([ AccessRightCreateInputSchema,AccessRightUncheckedCreateInputSchema ]),
}).strict()

export const AccessRightUpsertArgsSchema: z.ZodType<Omit<Prisma.AccessRightUpsertArgs, "select" | "include">> = z.object({
  where: AccessRightWhereUniqueInputSchema,
  create: z.union([ AccessRightCreateInputSchema,AccessRightUncheckedCreateInputSchema ]),
  update: z.union([ AccessRightUpdateInputSchema,AccessRightUncheckedUpdateInputSchema ]),
}).strict()

export const AccessRightCreateManyArgsSchema: z.ZodType<Prisma.AccessRightCreateManyArgs> = z.object({
  data: z.union([ AccessRightCreateManyInputSchema,AccessRightCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const AccessRightDeleteArgsSchema: z.ZodType<Omit<Prisma.AccessRightDeleteArgs, "select" | "include">> = z.object({
  where: AccessRightWhereUniqueInputSchema,
}).strict()

export const AccessRightUpdateArgsSchema: z.ZodType<Omit<Prisma.AccessRightUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ AccessRightUpdateInputSchema,AccessRightUncheckedUpdateInputSchema ]),
  where: AccessRightWhereUniqueInputSchema,
}).strict()

export const AccessRightUpdateManyArgsSchema: z.ZodType<Prisma.AccessRightUpdateManyArgs> = z.object({
  data: z.union([ AccessRightUpdateManyMutationInputSchema,AccessRightUncheckedUpdateManyInputSchema ]),
  where: AccessRightWhereInputSchema.optional(),
}).strict()

export const AccessRightDeleteManyArgsSchema: z.ZodType<Prisma.AccessRightDeleteManyArgs> = z.object({
  where: AccessRightWhereInputSchema.optional(),
}).strict()

export const WhiteListedDomainCreateArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainCreateArgs, "select">> = z.object({
  data: z.union([ WhiteListedDomainCreateInputSchema,WhiteListedDomainUncheckedCreateInputSchema ]),
}).strict()

export const WhiteListedDomainUpsertArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainUpsertArgs, "select">> = z.object({
  where: WhiteListedDomainWhereUniqueInputSchema,
  create: z.union([ WhiteListedDomainCreateInputSchema,WhiteListedDomainUncheckedCreateInputSchema ]),
  update: z.union([ WhiteListedDomainUpdateInputSchema,WhiteListedDomainUncheckedUpdateInputSchema ]),
}).strict()

export const WhiteListedDomainCreateManyArgsSchema: z.ZodType<Prisma.WhiteListedDomainCreateManyArgs> = z.object({
  data: z.union([ WhiteListedDomainCreateManyInputSchema,WhiteListedDomainCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const WhiteListedDomainDeleteArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainDeleteArgs, "select">> = z.object({
  where: WhiteListedDomainWhereUniqueInputSchema,
}).strict()

export const WhiteListedDomainUpdateArgsSchema: z.ZodType<Omit<Prisma.WhiteListedDomainUpdateArgs, "select">> = z.object({
  data: z.union([ WhiteListedDomainUpdateInputSchema,WhiteListedDomainUncheckedUpdateInputSchema ]),
  where: WhiteListedDomainWhereUniqueInputSchema,
}).strict()

export const WhiteListedDomainUpdateManyArgsSchema: z.ZodType<Prisma.WhiteListedDomainUpdateManyArgs> = z.object({
  data: z.union([ WhiteListedDomainUpdateManyMutationInputSchema,WhiteListedDomainUncheckedUpdateManyInputSchema ]),
  where: WhiteListedDomainWhereInputSchema.optional(),
}).strict()

export const WhiteListedDomainDeleteManyArgsSchema: z.ZodType<Prisma.WhiteListedDomainDeleteManyArgs> = z.object({
  where: WhiteListedDomainWhereInputSchema.optional(),
}).strict()

export const FavoriteCreateArgsSchema: z.ZodType<Omit<Prisma.FavoriteCreateArgs, "select" | "include">> = z.object({
  data: z.union([ FavoriteCreateInputSchema,FavoriteUncheckedCreateInputSchema ]),
}).strict()

export const FavoriteUpsertArgsSchema: z.ZodType<Omit<Prisma.FavoriteUpsertArgs, "select" | "include">> = z.object({
  where: FavoriteWhereUniqueInputSchema,
  create: z.union([ FavoriteCreateInputSchema,FavoriteUncheckedCreateInputSchema ]),
  update: z.union([ FavoriteUpdateInputSchema,FavoriteUncheckedUpdateInputSchema ]),
}).strict()

export const FavoriteCreateManyArgsSchema: z.ZodType<Prisma.FavoriteCreateManyArgs> = z.object({
  data: z.union([ FavoriteCreateManyInputSchema,FavoriteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const FavoriteDeleteArgsSchema: z.ZodType<Omit<Prisma.FavoriteDeleteArgs, "select" | "include">> = z.object({
  where: FavoriteWhereUniqueInputSchema,
}).strict()

export const FavoriteUpdateArgsSchema: z.ZodType<Omit<Prisma.FavoriteUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ FavoriteUpdateInputSchema,FavoriteUncheckedUpdateInputSchema ]),
  where: FavoriteWhereUniqueInputSchema,
}).strict()

export const FavoriteUpdateManyArgsSchema: z.ZodType<Prisma.FavoriteUpdateManyArgs> = z.object({
  data: z.union([ FavoriteUpdateManyMutationInputSchema,FavoriteUncheckedUpdateManyInputSchema ]),
  where: FavoriteWhereInputSchema.optional(),
}).strict()

export const FavoriteDeleteManyArgsSchema: z.ZodType<Prisma.FavoriteDeleteManyArgs> = z.object({
  where: FavoriteWhereInputSchema.optional(),
}).strict()

export const ReviewCreateArgsSchema: z.ZodType<Omit<Prisma.ReviewCreateArgs, "select" | "include">> = z.object({
  data: z.union([ ReviewCreateInputSchema,ReviewUncheckedCreateInputSchema ]),
}).strict()

export const ReviewUpsertArgsSchema: z.ZodType<Omit<Prisma.ReviewUpsertArgs, "select" | "include">> = z.object({
  where: ReviewWhereUniqueInputSchema,
  create: z.union([ ReviewCreateInputSchema,ReviewUncheckedCreateInputSchema ]),
  update: z.union([ ReviewUpdateInputSchema,ReviewUncheckedUpdateInputSchema ]),
}).strict()

export const ReviewCreateManyArgsSchema: z.ZodType<Prisma.ReviewCreateManyArgs> = z.object({
  data: z.union([ ReviewCreateManyInputSchema,ReviewCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const ReviewDeleteArgsSchema: z.ZodType<Omit<Prisma.ReviewDeleteArgs, "select" | "include">> = z.object({
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewUpdateArgsSchema: z.ZodType<Omit<Prisma.ReviewUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ ReviewUpdateInputSchema,ReviewUncheckedUpdateInputSchema ]),
  where: ReviewWhereUniqueInputSchema,
}).strict()

export const ReviewUpdateManyArgsSchema: z.ZodType<Prisma.ReviewUpdateManyArgs> = z.object({
  data: z.union([ ReviewUpdateManyMutationInputSchema,ReviewUncheckedUpdateManyInputSchema ]),
  where: ReviewWhereInputSchema.optional(),
}).strict()

export const ReviewDeleteManyArgsSchema: z.ZodType<Prisma.ReviewDeleteManyArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
}).strict()

export const AnswerCreateArgsSchema: z.ZodType<Omit<Prisma.AnswerCreateArgs, "select" | "include">> = z.object({
  data: z.union([ AnswerCreateInputSchema,AnswerUncheckedCreateInputSchema ]),
}).strict()

export const AnswerUpsertArgsSchema: z.ZodType<Omit<Prisma.AnswerUpsertArgs, "select" | "include">> = z.object({
  where: AnswerWhereUniqueInputSchema,
  create: z.union([ AnswerCreateInputSchema,AnswerUncheckedCreateInputSchema ]),
  update: z.union([ AnswerUpdateInputSchema,AnswerUncheckedUpdateInputSchema ]),
}).strict()

export const AnswerCreateManyArgsSchema: z.ZodType<Prisma.AnswerCreateManyArgs> = z.object({
  data: z.union([ AnswerCreateManyInputSchema,AnswerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict()

export const AnswerDeleteArgsSchema: z.ZodType<Omit<Prisma.AnswerDeleteArgs, "select" | "include">> = z.object({
  where: AnswerWhereUniqueInputSchema,
}).strict()

export const AnswerUpdateArgsSchema: z.ZodType<Omit<Prisma.AnswerUpdateArgs, "select" | "include">> = z.object({
  data: z.union([ AnswerUpdateInputSchema,AnswerUncheckedUpdateInputSchema ]),
  where: AnswerWhereUniqueInputSchema,
}).strict()

export const AnswerUpdateManyArgsSchema: z.ZodType<Prisma.AnswerUpdateManyArgs> = z.object({
  data: z.union([ AnswerUpdateManyMutationInputSchema,AnswerUncheckedUpdateManyInputSchema ]),
  where: AnswerWhereInputSchema.optional(),
}).strict()

export const AnswerDeleteManyArgsSchema: z.ZodType<Prisma.AnswerDeleteManyArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
}).strict()