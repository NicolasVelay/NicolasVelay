---
title: 'Welcome to the jungle'
description: 'Or when I decided to make a blog with an (almost) full new stack and deploy it.'
pubDate: 2025-12-03
tags: ["astro", "blogging", "learning in public"]
theme: "https://www.youtube.com/watch?v=tGsKzZtRwxw" 
shown: true
---

So it begins. New year new me, and I've wanted to start a blog for quite some time now. 
My motivations are ***simple***, I want to share cool stuff I learn. 

And so, I've learned an almost new stack, yeah, did I said I wanted to learn cool new things ?

So, I looked at past year <a href="https://2024.stateofjs.com/en-US" target="_blank">state of javascript</a>... Vue, React, Svelte, yeah we know these ones... what about this one, ***Astro*** ? Yeah I've heard of it, what can it do ?

My face when I saw how cool Astro is: 🤯

Just have to follow <a href="https://docs.astro.build/en/tutorial/0-introduction/" target="_blank">the guide</a>. It's seamless, you'll have a blog up and running in no time.

Then it is just a matter of tweaking the css, html and a bit of javascript (we know these ones right?)... right ? 

After almost 7 years of frontend development, using React with a lot of handmade components and even an in-house design system made with tailwind, I almost forgot about vanilla javascript and css. But in the end, what can't we do with the basics ? (spoiler: *almost* nothing)

I just won't talk about the whole day I took to code a vanilla custom AudioPlayer, only to realize that I would have to use royalty free music... 
Let's just build the blog for now.

```sh
npm run build
```
You now have a /dist folder with all your assets. The blog is ready, it's time to deploy. (Note that we used Astro, but you could also use old-fashioned React or Vue...)

## Deploying... with a brand new stack.

Ever heard of Vercel, Netlify, Github Pages ? Please use that if you want something done quick, otherwise...

Time to use the AWS suite, specifically S3, CloudFront and Route53. AWS amplify exsit also, but it's costly, and too easy. I assume you already have a domain name, otherwise you can purchase one using Route53 (which is the domain name registrar of amazon) or any other registrar.

Let's begin:

- Create your AWS account. 
- Select your region, be careful, price can change depending on region.

### S3

So S3 is where you put your /dist (or /build) files, it's like an online folder. It's easy enough to understand. You first need to create a new S3 bucket (that's how amazon call their folders).

- Search the S3 service on the top search bar, select it and click "create bucket".
- Change the bucket name to be the same as your domain name. (e.g nicolasvelay.com)
- Uncheck "Block all public access". For now your bucket will be public and accessible from everywhere. That will change once we dive into CloudFront.
- Create your bucket. 

Are we... done ? Hell no.

- Go to the bucket list and select your newly created bucket. 
- Click on the "Properties" tab.
- Scroll until "Static web hosting" and select edit. 
- Enable static webhosting.
- "Index document" should be index.html, "Error document" should be whatever html page you made for 404 errors.

Ok our bucket is set up. Or is it ? Yeah did you think that just unchecking public access would do ? No, no, no... AWS got a lot of security features, and we need to add a policy for the bucket. 

- Go to the permission tab.
- Edit the bucket policy and add the following. (Be mindful to change your arn with your actual bucket name)

```json 
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<MY_BUCKET_NAME>/*"
        }
    ]
}
```
BTW arn are identifiers for your ressources at AWS, since there is a lot of services, we need unique identifiers. 


Please tell me we are done... Yeah, it's done for bucket configuration. Now we need to put our local /dist folder into the bucket. There is an upload button in the "Objects" tab of your bucket, simple, easy.

Or...

We could also use the aws CLI. 

| But... I don't like using CLIs.

No trust me, this one is cool. 

## How to feel like Neo: use the AWS CLI

So one of the good practice in AWS is to create an user for each of what you do, this way, if the user is compromised, your whole AWS account won't turn Skynet.

### Create an IAM user

"IAM" is the AWS service to create users and attach policies (what they can do) to them.

- Go to the IAM service.
- Create a new user (you can name it AWS-CLI for example).
- Attach policies (you can attach the "AdministratorAccess" if you want to user to be admin feel free to be more granular if you want, by attaching s3/cloudfront policies instead).
- Create the user.

We created an admin IAM user which is admin. Now we need to retrieve its access keys.

- Go to the security credentials tab.
- Create an access key. (Select CLI for use case)

Now on linux, install the aws cli. On Ubuntu:

```sh title="Installing the aws cli"
apt install awscli
```

Then configure and paste your previously created access key ID and value. Your default region name, and the output format (XML or JSON)

```sh title="Configuring the aws cli" {3, 4}
aws configure

AWS Access Key ID [None]: ***************
AWS Secret Access Key [None]: **************
Default region name [None]: eu-north-1
Default output format [None]: JSON
```

And now, the magic begins. We can use the CLI to copy the /dist local folder to our bucket:

```sh title="Copying your local files to the bucket"
s3 sync build/ s3://<MY_BUCKET_NAME>
```

You can now look into your bucket and see your files in the "Objects" tab. Also, you can go in the "Properties" tab, scroll to the very bottom and there should be a link, your "Bucket website endpoint". Click on it and....

:sparkles: magic :sparkles:

You now have access to your site.

| Are we done ???

Your site is ... not secure unfortunately, noted by the lock icon in the navbar of your browser. Also, what in hell is this URL ? Do you really want to share that ? No, no, no... So it is time for...

## CloudFront

But first...

### Create a certificate

Yeah, we want that S (for Secure) in HTTPS. So we will create a free public certificate thanks to AWS. We will use another service called ACM (AWS Certificate Manager).

- Navigate to the service and request a public certificate.
- Input your domain name don't change anything else.

Now, you are on your certificate detail, pending validation. In the "Domains" subsection, you have a table with your domain and most importantly a CNAME name and a CNAME value.

It's heavily summarized but AWS is pinging the CNAME name (which is part of your domain name) and expect it to reroute to the CNAME value, this way, they can exchange keys.

- Go to your Domain Name registrar and search for the option to ADD a CNAME record (it's a redirection from the URL "NAME" to the URL "value")
- Input in the CNAME name the one you copied from ACM, same for the CNAME value.
- Wait that your domain is certified.

### Back to Cloudfront

Now we can create a distribution in Cloudfront, which is where you'll be able to set some settings about cache, security, redirection...

- Go to the Cloudfront service and select your bucket. (AWS kinly tell us to use the "website endpoint", we can do that.)
- Scroll until "Viewer protocol policy" and select "Redirect HTTP to HTTPS"
- You can disable the WAF for now.
- Add an "Alternate domain name (CNAME)" with a value of your domain name. 
- Select your custom SSL certificate that you just created. 
- Create the distribution.

We now have a more secure distribution, that will handle cache by default, it's a must over S3. (And it will lower the costs !)

You can now go to the "General" tab of your distribution detail and go to the url under "Distribution domain name", it's your distribution URL, and now you have a lock icon indicating that the browser is using https, cool.

### Redirection in your registrar

Remember when we talked about CNAME redirection for the certificate ? We have to do the same but for your domain name.

- Again, go to your Domain Name registrar and add a CNAME record.
- Input in the CNAME name your domain name (e.g nicolasvelay.com), and for the CNAME value, your distribution URL.

Now your domain name is redirecting to your cloudfront distribution.

### Cleaning up

We made the bucket public, but it is not secure, let's now remove the option

- Go to your bucket details.
- Go to the "Permissions" tab and edit "Block public access"
- Check "Block all public access" and save changes

And VOILA, you now have a fully functionnal static blog hosted on AWS.
