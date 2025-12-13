import ProfileCard from '../ProfileCard';

// todo: remove mock functionality
export default function ProfileCardExample() {
  return (
    <ProfileCard
      username="gaearon"
      name="Dan Abramov"
      avatar="https://avatars.githubusercontent.com/u/810438"
      bio="Working on @reactjs. Co-author of Redux and Create React App."
      repos={250}
      followers={85000}
      location="London, UK"
    />
  );
}
